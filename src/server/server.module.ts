import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import serverConfig from './server.config';

@Module({ imports: [ConfigModule.forFeature(serverConfig)] })
export class ServerModule {}
