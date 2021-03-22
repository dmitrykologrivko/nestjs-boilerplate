import { Module } from '@nestjs/common';
import { CoreModule, ConfigModule, DatabaseModule } from '@nestjs-boilerplate/core';
import { AuthModule } from '@nestjs-boilerplate/auth';
import { Note } from './note.entity';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import appConfig from './app.config';

@Module({
    imports: [
        CoreModule.forRoot({
            config: ConfigModule.forRoot({
                load: [appConfig],
            }),
        }),
        AuthModule.forRoot(),
        DatabaseModule.withEntities([Note]),
    ],
    providers: [NoteService],
    controllers: [NoteController],
})
export class AppModule {}
