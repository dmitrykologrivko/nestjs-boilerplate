import { Module } from '@nestjs/common';
import { CoreModule, ConfigModule } from '@nestjs-boilerplate/core';
import { AuthModule } from '../../src/auth.module';
import appConfig from './app.config';

@Module({
  imports: [
      CoreModule.forRoot({
          config: ConfigModule.forRoot({
              load: [appConfig],
          }),
      }),
      AuthModule.forRoot(),
  ],
})
export class AppModule {}
