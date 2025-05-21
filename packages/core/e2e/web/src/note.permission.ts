import { BaseEntityPermission } from '../../../src/application/permissions/base-entity.permission';
import { BaseInput } from '../../../src/application/dto/base.input';
import { Note } from './note.entity';

export class NotePermission extends BaseEntityPermission<BaseInput, Note> {
    constructor() {
        super('Forbidden Note');
    }

    async hasEntityPermission(_: BaseInput, entity: Note): Promise<boolean> {
        return entity.note !== 'Forbidden Note';
    }
}
