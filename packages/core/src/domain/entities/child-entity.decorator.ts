import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import {
    DatabaseChildEntity,
    DatabaseChildEntityOptions,
} from '../../database/database-child-entity.decorator';

const ID_PROPERTY = 'id';
const CREATED_PROPERTY = 'created';
const UPDATED_PROPERTY = 'updated';
const DELETED_PROPERTY = 'deleted';

export function ChildEntity(options?: DatabaseChildEntityOptions): ClassDecorator {
    return (target: Function) => {
        PrimaryGeneratedColumn()(target.prototype, ID_PROPERTY);
        CreateDateColumn()(target.prototype, CREATED_PROPERTY);
        UpdateDateColumn()(target.prototype, UPDATED_PROPERTY);
        DeleteDateColumn()(target.prototype, DELETED_PROPERTY);
        DatabaseChildEntity(options)(target);
    };
}
