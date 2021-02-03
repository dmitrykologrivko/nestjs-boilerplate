import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
    BaseCrudService,
    InjectRepository,
    PagePagination,
    ListInput,
} from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { NoteDto } from './note.dto';

@Injectable()
export class NoteService extends BaseCrudService<Note, NoteDto> {
    constructor(
        @InjectRepository(Note)
        private noteRepository: Repository<Note>,
    ) {
        super(noteRepository, Note, NoteDto, NoteDto, NoteDto);
    }

    protected getPagination(input: ListInput): (qb: SelectQueryBuilder<Note>) => PagePagination<Note> {
        return qb => new PagePagination(qb, input);
    }
}
