import { Module } from '@nestjs/common';
import { CoreModule } from '@nest-boilerplate/core';
import { AuthModule } from '../../src/auth.module';
import appConfig from './app.config';

@Module({
  imports: [
      CoreModule.forRoot({
          config: [appConfig],
      }),
      AuthModule.forRoot(),
  ],
})
export class AppModule {}