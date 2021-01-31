import { ChildEntity as TypeOrmChildEntity } from 'typeorm';

export interface DatabaseChildEntityOptions {
    discriminatorValue?: any;
}

export function ChildEntity(options: DatabaseChildEntityOptions = {}): ClassDecorator {
    return (constructor: Function) => {
        TypeOrmChildEntity(options.discriminatorValue)(constructor);
    };
}
