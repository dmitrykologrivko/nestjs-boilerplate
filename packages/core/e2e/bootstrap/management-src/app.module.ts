import { Module } from '@nestjs/common';
import { CoreModule } from '../../../src/core.module';
import { GreetingsCommand } from './greetings.command';

@Module({
    imports: [
        CoreModule.forRoot({}),
    ],
    providers: [
        GreetingsCommand
    ],
})
export class AppModule {}
