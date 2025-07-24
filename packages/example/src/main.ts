import { Bootstrap } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

async function bootstrap() {
    await new Bootstrap(AppModule).startApplication();
}

bootstrap().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
});
