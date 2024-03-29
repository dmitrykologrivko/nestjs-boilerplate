import { Column } from 'typeorm';
import {
    Entity,
    BaseTypeormEntity,
    Validate,
    ValidationContainerException,
    Result
} from '@nestjs-boilerplate/core';

export const PERMISSION_NAME_MAX_LENGTH = 255;
export const CODENAME_MAX_LENGTH = 100;

@Entity()
export class Permission extends BaseTypeormEntity {

    @Column({
        length: PERMISSION_NAME_MAX_LENGTH,
    })
    name: string;

    @Column({
        length: CODENAME_MAX_LENGTH,
        unique: true,
    })
    codename: string;

    constructor(name: string, codename: string) {
        super();
        this.name = name;
        this.codename = codename;
    }

    /**
     * Creates new permission instance
     * @param name permission name
     * @param codename permission codename
     * @return permission creation result
     */
    static create(
        name: string,
        codename: string,
    ): Result<Permission, ValidationContainerException> {
        const validateResult = Validate.withResults([
            Permission.validateName(name),
            Permission.validateCodename(codename),
        ]);

        return validateResult.map(() => new Permission(name, codename));
    }

    private static validateName(name: string) {
        return Validate.withProperty('name', name)
            .isNotEmpty()
            .maxLength(PERMISSION_NAME_MAX_LENGTH)
            .isValid();
    }

    private static validateCodename(codename: string) {
        return Validate.withProperty('codename', codename)
            .isNotEmpty()
            .maxLength(CODENAME_MAX_LENGTH)
            .isValid();
    }
}
