import { bootstrapApplication } from '@nest-boilerplate/core';
import { AppModule } from './app.module';

bootstrapApplication({ module: AppModule })
    .then(bootstrapper => bootstrapper.start());
