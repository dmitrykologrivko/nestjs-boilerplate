import { Repository, SelectQueryBuilder } from 'typeorm';
import {
    ApplicationService,
    BaseCrudService,
    InjectRepository,
    PagePagination,
    ListInput,
} from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { NoteDto } from './note.dto';

@ApplicationService()
export class NoteService extends BaseCrudService<Note, NoteDto> {
    constructor(
        @InjectRepository(Note)
        private noteRepository: Repository<Note>,
    ) {
        super(
            noteRepository,
            {
                entityCls: Note,
                listOutputCls: NoteDto,
                retrieveOutputCls: NoteDto,
                createPayloadCls: NoteDto,
                createOutputCls: NoteDto,
                updatePayloadCls: NoteDto,
                updateOutputCls: NoteDto,
            },
        );
    }

    protected getPagination(input: ListInput): (qb: SelectQueryBuilder<Note>) => PagePagination<Note> {
        return qb => new PagePagination(qb, input);
    }
}
