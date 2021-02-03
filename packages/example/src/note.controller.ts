import { CrudController, ApiController } from '@nestjs-boilerplate/core';
import { NoteService } from './note.service';
import { NoteDto } from './note.dto';

@ApiController('notes')
export class NoteController extends CrudController<NoteDto> {
    constructor(
        private noteService: NoteService,
    ) {
        super(noteService);
    }
}
