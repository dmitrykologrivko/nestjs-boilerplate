import { Module } from '@nestjs/common';
import {
    CoreModule,
    DatabaseModule,
    DEFAULT_DATA_SOURCE_NAME,
} from '@nestjs-boilerplate/core';
import { UserModule } from '../../../src/user.module';

@Module({
    imports: [
        CoreModule.forRoot({
            imports: [
                DatabaseModule.withOptions([
                    {
                        name: DEFAULT_DATA_SOURCE_NAME,
                        type: 'sqlite',
                        database: 'database',
                        entities: [],
                        synchronize: true
                    }
                ]),
            ],
        }),
        UserModule
    ],
})
export class AppModule {}
