import { ApiController } from '../../../src/web/decorators/api-controller.decorator';
import { CrudController } from '../../../src/web/controllers/crud.controller';
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
