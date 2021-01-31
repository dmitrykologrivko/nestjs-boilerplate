import { Column, ManyToMany, JoinTable } from 'typeorm';
import {
    Entity,
    BaseTypeormEntity,
    Validate,
    ValidationContainerException,
    Result
} from '@nestjs-boilerplate/core';
import { Permission } from './permission.entity';

export const GROUP_NAME_MAX_LENGTH = 150;

@Entity()
export class Group extends BaseTypeormEntity {

    @Column({
        name: 'name',
        length: GROUP_NAME_MAX_LENGTH,
    })
    private readonly _name: string;

    @ManyToMany(type => Permission)
    @JoinTable()
    private _permissions: Permission[];

    private constructor(name: string) {
        super();
        this._name = name;
    }

    /**
     * Creates new permission instance
     * @param name permission name
     * @return group creation result
     */
    static create(name: string): Result<Group, ValidationContainerException> {
        const validateResult = Validate.withResults([
            Group.validateName(name),
        ]);

        return validateResult.map(() => new Group(name));
    }

    get name(): string {
        return this._name;
    }

    get permissions(): Permission[] {
        return this._permissions;
    }

    /**
     * Checks if group has permission
     * @param codename Permission codename
     * @return true if group has permission else false
     */
    hasPermission(codename: string) {
        return this._permissions && !!this._permissions.find(permission => permission.codename === codename);
    }

    /**
     * Sets permission to group
     * @param permission permission
     */
    setPermission(permission: Permission) {
        if (!this.hasPermission(permission.codename)) {
            if (!this._permissions) {
                this._permissions = [];
            }

            this._permissions.push(permission);
        }
    }

    /**
     * Removes permission for group
     * @param codename permission codename
     */
    removePermission(codename: string) {
        if (!this._permissions) {
            return;
        }

        this._permissions = this._permissions.filter(permission => permission.codename !== codename);
    }

    private static validateName(name: string) {
        return Validate.withProperty('name', name)
            .isNotEmpty()
            .maxLength(GROUP_NAME_MAX_LENGTH)
            .isValid();
    }
}
