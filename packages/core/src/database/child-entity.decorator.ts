import { ChildEntity as TypeOrmChildEntity } from 'typeorm';
import { TFunction } from '../utils/type.utils';

export interface DatabaseChildEntityOptions {
    discriminatorValue?: any;
}

export function ChildEntity(options: DatabaseChildEntityOptions = {}): ClassDecorator {
    return (constructor: TFunction) => {
        TypeOrmChildEntity(options.discriminatorValue)(constructor);
    };
}
