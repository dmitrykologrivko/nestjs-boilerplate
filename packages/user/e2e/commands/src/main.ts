import { Bootstrap } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new Bootstrap(AppModule)
    .startApplication()
    .then();
