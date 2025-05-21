import { DataSource, SelectQueryBuilder } from 'typeorm';
import { ApplicationService } from '../../../src/application/service/application-service.decorator';
import { BaseCrudService } from '../../../src/application/service/base-crud.service';
import { BaseFilter } from '../../../src/application/filters/base.filter';
import { SearchFilter } from '../../../src/application/filters/search.filter';
import { WhereFilter } from '../../../src/application/filters/where.filter';
import { PagePagination } from '../../../src/application/pagination/page.pagination';
import { ListInput } from '../../../src/application/dto/list.input';
import { BaseEntityPermission } from '../../../src/application/permissions/base-entity.permission';
import { Note } from './note.entity';
import { NoteDto } from './note.dto';
import { NotePermission } from './note.permission';

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

    protected getFilters(input: ListInput, qb: SelectQueryBuilder<Note>): BaseFilter<Note>[] {
        return [
            new SearchFilter(qb, input, { searchFields: ['note'] }),
            new WhereFilter(qb, input, { filterFields: ['note'] }),
        ];
    }

    protected getEntityPermissions(): BaseEntityPermission[] {
        return [
            new NotePermission()
        ];
    }
}
