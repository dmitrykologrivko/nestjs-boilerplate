import { ValidationContainerException } from '@nestjs-boilerplate/core';
import { Permission } from '../../entities';

describe('PermissionEntity', () => {
    describe('#create()', () => {
        it('when input is valid should create permission instance', () => {
            const permission = Permission.create('Test Permission', 'test.permission');
            expect(permission).toBeInstanceOf(Permission);
            expect(permission.name).toBe('Test Permission');
            expect(permission.codename).toBe('test.permission');
        });

        it('when input is not valid throw validation error', () => {
            try {
                Permission.create(undefined, undefined);
            } catch (e) {
                expect(e).toBeInstanceOf(ValidationContainerException);
                expect(e.validationExceptions).toHaveLength(2);
                expect(e.validationExceptions[0].property).toBe('name');
                expect(e.validationExceptions[0].constraints.isNotEmpty).toBe('name is empty');
                expect(e.validationExceptions[1].property).toBe('codename');
                expect(e.validationExceptions[1].constraints.isNotEmpty).toBe('codename is empty');
            }
        });
    });
});
