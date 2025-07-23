import { Module } from '@nestjs/common';
import { CoreModule } from '../../../src/core.module';
import { PingController } from './ping.controller';

@Module({
    imports: [
        CoreModule.forRoot({}),
    ],
    controllers: [PingController],
})
export class AppModule {}
