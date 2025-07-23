import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseModule } from '../../../src/database/database.module';
import { CoreModule } from '../../../src/core.module';
import { Note } from './note.entity';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import appConfig from './app.config';

@Module({
    imports: [
        CoreModule.forRoot({
            config: {
                load: [appConfig],
            },
        }),
        DatabaseModule.withEntities([Note]),
    ],
    providers: [NoteService],
    controllers: [NoteController],
})
export class AppModule {}
