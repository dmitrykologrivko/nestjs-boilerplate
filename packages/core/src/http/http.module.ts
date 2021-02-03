import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import httpConfig from './http.config';

@Module({ imports: [ConfigModule.forFeature(httpConfig)] })
export class HttpModule {}
