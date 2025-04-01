import { Column } from 'typeorm';
import { Entity, BaseTypeormEntity, Validate } from '@nestjs-boilerplate/core';

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
     * @throws ValidationContainerException
     * @return permission instance
     */
    static create(
        name: string,
        codename: string,
    ): Permission {
        Validate.withResults([
            Permission.validateName(name),
            Permission.validateCodename(codename),
        ]);

        return new Permission(name, codename);
    }

    private static validateName(name: string) {
        return Validate.withProperty('name', name)
            .isNotEmpty()
            .maxLength(PERMISSION_NAME_MAX_LENGTH)
            .getValidationResult();
    }

    private static validateCodename(codename: string) {
        return Validate.withProperty('codename', codename)
            .isNotEmpty()
            .maxLength(CODENAME_MAX_LENGTH)
            .getValidationResult();
    }
}
