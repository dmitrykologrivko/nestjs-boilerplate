import { Column, ManyToMany, JoinTable } from 'typeorm';
import { Entity, BaseTypeormEntity, Validate } from '@nestjs-boilerplate/core';
import { Permission } from './permission.entity';

export const GROUP_NAME_MAX_LENGTH = 150;

@Entity()
export class Group extends BaseTypeormEntity {

    @Column({
        length: GROUP_NAME_MAX_LENGTH,
    })
    name: string;

    @ManyToMany(type => Permission)
    @JoinTable()
    permissions: Permission[];

    constructor(name: string) {
        super();
        this.name = name;
    }

    /**
     * Creates new permission instance
     * @param name permission name
     * @throws ValidationContainerException
     * @return group instance
     */
    static create(name: string): Group {
        Validate.withResults([
            Group.validateName(name),
        ]);

        return new Group(name);
    }

    /**
     * Checks if group has permission
     * @param codename Permission codename
     * @return true if group has permission else false
     */
    hasPermission(codename: string) {
        return this.permissions && !!this.permissions.find(permission => permission.codename === codename);
    }

    /**
     * Sets permission to group
     * @param permission permission
     */
    setPermission(permission: Permission) {
        if (!this.hasPermission(permission.codename)) {
            if (!this.permissions) {
                this.permissions = [];
            }

            this.permissions.push(permission);
        }
    }

    /**
     * Removes permission for group
     * @param codename permission codename
     */
    removePermission(codename: string) {
        if (!this.permissions) {
            return;
        }

        this.permissions = this.permissions.filter(permission => permission.codename !== codename);
    }

    private static validateName(name: string) {
        return Validate.withProperty('name', name)
            .isNotEmpty()
            .maxLength(GROUP_NAME_MAX_LENGTH)
            .getValidationResult();
    }
}
