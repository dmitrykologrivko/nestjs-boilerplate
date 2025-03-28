import * as bcrypt from 'bcrypt';
import { Column, JoinTable, ManyToMany } from 'typeorm';
import { isEmail } from 'class-validator';
import { Entity, BaseTypeormEntity, Validate } from '@nestjs-boilerplate/core';
import { Permission } from './permission.entity';
import { Group } from './group.entity';

export const USERNAME_MAX_LENGTH = 150;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 254;
export const FIRST_NAME_MAX_LENGTH = 30;
export const LAST_NAME_MAX_LENGTH = 150;

@Entity({ swappable: true })
export class User extends BaseTypeormEntity {

    @Column({
        length: USERNAME_MAX_LENGTH,
        unique: true,
    })
    username: string;

    @Column({
        length: PASSWORD_MAX_LENGTH,
    })
    password: string;

    @Column({
        length: EMAIL_MAX_LENGTH,
        unique: true,
    })
    email: string;

    @Column({
        length: FIRST_NAME_MAX_LENGTH,
    })
    firstName: string;

    @Column({
        length: LAST_NAME_MAX_LENGTH,
    })
    lastName: string;

    @Column({
        default: true,
    })
    isActive: boolean;

    @Column({
        default: false,
    })
    isAdmin: boolean;

    @Column({
        default: false,
    })
    isSuperuser: boolean;

    @ManyToMany(type => Group)
    @JoinTable()
    groups: Group[];

    @ManyToMany(type => Permission)
    @JoinTable()
    permissions: Permission[];

    constructor(
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        isActive: boolean = false,
        isAdmin: boolean = false,
        isSuperuser: boolean = false,
    ) {
        super();
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.isActive = isActive;
        this.isAdmin = isAdmin;
        this.isSuperuser = isSuperuser;
    }

    /**
     * Creates new user instance
     * @param username username
     * @param password password
     * @param email email
     * @param firstName first name
     * @param lastName last name
     * @param isActive flag to indicate if user is active
     * @param isAdmin flag to indicate if user is admin
     * @param isSuperuser flag to indicate if user is superuser
     * @param saltRounds salt rounds used for hashing password. default is 10.
     * @throws ValidationContainerException
     * @return user instance
     */
    static async create(
        username: string,
        password: string,
        email: string,
        firstName: string,
        lastName: string,
        isActive: boolean = false,
        isAdmin: boolean = false,
        isSuperuser: boolean = false,
        saltRounds: number = 10,
    ): Promise<User> {
        Validate.withResults([
            User.validateUsername(username),
            User.validatePassword(password),
            User.validateEmail(email),
            User.validateFirstName(firstName),
            User.validateLastName(lastName),
        ]);

        const user = new User(
            username,
            email,
            firstName,
            lastName,
            isActive,
            isAdmin,
            isSuperuser,
        );

        await user.setPassword(password, saltRounds);

        return user;
    }

    /**
     * Changes current username
     * @param username new username
     */
    changeUsername(username: string): void {
        Validate.withResult(
            User.validateUsername(username),
        );

        this.username = username;
    }

    /**
     * Changes current email
     * @param email new email
     */
    changeEmail(email: string): void {
        Validate.withResult(
            User.validateEmail(email),
        );

        this.email = email;
    }

    /**
     * Changes current first and last name
     * @param firstName new first name
     * @param lastName new last name
     */
    changeName(firstName: string, lastName: string): void {
        Validate.withResults([
            User.validateFirstName(firstName),
            User.validateLastName(lastName),
        ]);

        this.firstName = firstName;
        this.lastName = lastName;
    }

    /**
     * Activates current user
     */
    activateUser() {
        this.isActive = true;
    }

    /**
     * Deactivates current user
     */
    deactivateUser() {
        this.isActive = false;
    }

    /**
     * Sets current user as an admin user
     */
    setAdminAccess() {
        this.isAdmin = true;
    }

    /**
     * Sets current user as not admin user
     */
    denyAdminAccess() {
        this.isAdmin = false;
    }

    /**
     * Sets current user as a superuser
     */
    setSuperuserAccess() {
        this.isSuperuser = true;
    }

    /**
     * Sets current user as not superuser
     */
    denySuperuserAccess() {
        this.isSuperuser = false;
    }

    /**
     * Returns full name (first and last name) of user
     * @returns {string}
     */
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    /**
     * Returns short name (first name) of user
     * @returns {string}
     */
    getShortName() {
        return this.firstName;
    }

    /**
     * Sets password hash from plain password
     * @param password Plain password
     * @param saltRounds Salt Rounds
     */
    async setPassword(password: string, saltRounds: number): Promise<void> {
        Validate.withResult(
            User.validatePassword(password),
        );

        this.password = await bcrypt.hash(password, saltRounds);
    }

    /**
     * Compares plain password with existing user`s password hash
     * @param password Plain password
     */
    async comparePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }

    /**
     * Checks if user or one of user`s group has permission.
     * If user is active superuser always returns true.
     * @param codename Permission codename
     * @return true if user has permission else false
     */
    hasPermission(codename: string) {
        // Active superusers users have all permissions
        if (this.isActive && this.isSuperuser) {
            return true;
        }

        if (this.findUserPermission(codename)) {
            return true;
        }

        if (this.groups) {
            for (const group of this.groups) {
                if (group.hasPermission(codename)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Adds permission to user
     * @param permission {Permission}
     */
    addUserPermission(permission: Permission) {
        if (!this.findUserPermission(permission.codename)) {
            if (!this.permissions) {
                this.permissions = [];
            }

            this.permissions.push(permission);
        }
    }

    /**
     * Removes permission from user
     * @param codename {string} Permission codename
     */
    removeUserPermission(codename: string) {
        if (!this.permissions) {
            return;
        }

        this.permissions = this.permissions.filter(permission => permission.codename !== codename);
    }

    /**
     * Adds user to group
     * @param group {Group}
     */
    addToGroup(group: Group) {
        if (!this.findGroup(group)) {
            if (!this.groups) {
                this.groups = [];
            }

            this.groups.push(group);
        }
    }

    /**
     * Removes user from group
     * @param group {Group}
     */
    removeFromGroup(group: Group) {
        if (!this.groups) {
            return;
        }

        this.groups = this.groups.filter(currentGroup => currentGroup.id !== group.id);
    }

    private static validateUsername(username: string) {
        return Validate.withProperty('username', username)
            .isNotEmpty()
            .maxLength(USERNAME_MAX_LENGTH)
            .isValid();
    }

    private static validatePassword(password: string) {
        return Validate.withProperty('password', password)
            .isNotEmpty()
            .minLength(PASSWORD_MIN_LENGTH)
            .maxLength(PASSWORD_MAX_LENGTH)
            .isValid();
    }

    private static validateEmail(email: string) {
        return Validate.withProperty('email', email)
            .custom('isEmail', 'is not email', isEmail)
            .maxLength(EMAIL_MAX_LENGTH)
            .isValid();
    }

    private static validateFirstName(firstName: string) {
        return Validate.withProperty('firstName', firstName)
            .isNotEmpty()
            .maxLength(FIRST_NAME_MAX_LENGTH)
            .isValid();
    }

    private static validateLastName(lastName: string) {
        return Validate.withProperty('lastName', lastName)
            .isNotEmpty()
            .maxLength(LAST_NAME_MAX_LENGTH)
            .isValid();
    }

    private findUserPermission(codename: string) {
        if (!this.permissions) {
            return null;
        }

        return this.permissions.find(permission => permission.codename === codename);
    }

    private findGroup(group: Group) {
        if (!this.groups) {
            return null;
        }

        return this.groups.find(currentGroup => currentGroup.id === group.id);
    }
}
