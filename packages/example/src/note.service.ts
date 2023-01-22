import { DataSource, SelectQueryBuilder } from 'typeorm';
import {
    ApplicationService,
    BaseCrudService,
    PagePagination,
    ListInput,
} from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { NoteDto } from './note.dto';

@ApplicationService()
export class NoteService extends BaseCrudService<Note, NoteDto> {
    constructor(
        protected dataSource: DataSource,
    ) {
        super(
            dataSource,
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

    protected getPagination(input: ListInput, qb: SelectQueryBuilder<Note>): PagePagination<Note> {
        return new PagePagination(qb, input);
    }
}
