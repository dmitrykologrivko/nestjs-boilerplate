import { INestMicroservice } from '@nestjs/common';
import {
    ClientProxy,
    Transport,
    ClientProxyFactory,
    MicroserviceOptions,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AppModule } from './microservice-src/app.module';
import { Bootstrap } from '../../src/bootstrap/bootstrap.util';
import { HOST, PORT } from './constants';

describe('Microservice Bootstrap', () => {
    let app: INestMicroservice;

    const client: ClientProxy = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
            host: HOST,
            port: PORT,
        },
    });

    beforeAll(async () => {
        app = await new Bootstrap(AppModule)
            .startMicroservice<MicroserviceOptions>({
                options: {
                    transport: Transport.TCP,
                    options: {
                        port: PORT
                    }
                }
            });
        await client.connect();
    });

    afterAll(async () => {
        client.close();
        await app.close();
    });

    it('app should be defined', async () => {
        expect(app).toBeDefined();
    });

    it('should respond to ping', async () => {
        const result = await firstValueFrom(client.send('ping', {}));
        expect(result).toEqual('pong');
    });
});
