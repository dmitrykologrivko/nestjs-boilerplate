import { Bootstrap } from '../../../src/bootstrap/bootstrap.util';
import { AppModule } from './app.module';

new Bootstrap(AppModule)
    .startApplication()
    .then();
