import { ModuleMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreModule } from '@nestjs-boilerplate/core';
import { DataSource } from 'typeorm';
import { UserService } from '../services/user.service';
import { UserVerificationService } from '../services/user-verification.service';
import { UserPasswordService } from '../services/user-password.service';
import { EmailUniqueConstraint } from '../validation/email-unique.constraint';
import { EmailActiveConstraint } from '../validation/email-active.constraint';
import { UsernameUniqueConstraint } from '../validation/username-unique.constraint';
import { UsernameExistsConstraint } from '../validation/username-exists.constraint';
import { PasswordMatchConstraint } from '../validation/password-match.constraint';
import { ResetPasswordTokenValidConstraint } from '../validation/reset-password-token-valid.constraint';
import { UsersCommand } from '../commands/users.command';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { Permission } from '../entities/permission.entity';
import userConfig from '../user.config';
import { UserModule } from '../user.module';


// import { DomainModule } from '../../domain/domin.module';
// import { EventBus } from '../../domain/events/event-bus.util';
// import { EntityEventsManager } from '../../domain/events/entity-events.manager';

describe('UserModule (Integration)', () => {
    let module: TestingModule;

    async function createTestingModule(metadata: ModuleMetadata) {
        module = await Test.createTestingModule(metadata).compile();
        return module;
    }

    afterEach(async () => {
        if (module) await module.close();
    });

    it('should register services in the module', async () => {
        module = await createTestingModule({
            imports: [
                CoreModule.forRoot(),
                UserModule,
            ]
        });

        const userService = module.get(UserService);
        const userVerificationService = module.get(UserVerificationService);
        const userPasswordService = module.get(UserPasswordService);
        const emailUniqueConstraint = module.get(EmailUniqueConstraint);
        const emailActiveConstraint = module.get(EmailActiveConstraint);
        const usernameUniqueConstraint = module.get(UsernameUniqueConstraint);
        const usernameExistsConstraint = module.get(UsernameExistsConstraint);
        const passwordMatchConstraint = module.get(PasswordMatchConstraint);
        const resetPasswordTokenValidConstraint = module.get(ResetPasswordTokenValidConstraint);
        const usersCommand = module.get(UsersCommand);

        expect(userService).toBeDefined();
        expect(userService).toBeInstanceOf(UserService);
        expect(userVerificationService).toBeDefined();
        expect(userVerificationService).toBeInstanceOf(UserVerificationService);
        expect(userPasswordService).toBeDefined();
        expect(userPasswordService).toBeInstanceOf(UserPasswordService);
        expect(emailUniqueConstraint).toBeDefined();
        expect(emailUniqueConstraint).toBeInstanceOf(EmailUniqueConstraint);
        expect(emailActiveConstraint).toBeDefined();
        expect(emailActiveConstraint).toBeInstanceOf(EmailActiveConstraint);
        expect(usernameUniqueConstraint).toBeDefined();
        expect(usernameUniqueConstraint).toBeInstanceOf(UsernameUniqueConstraint);
        expect(usernameExistsConstraint).toBeDefined();
        expect(usernameExistsConstraint).toBeInstanceOf(UsernameExistsConstraint);
        expect(passwordMatchConstraint).toBeDefined();
        expect(passwordMatchConstraint).toBeInstanceOf(PasswordMatchConstraint);
        expect(resetPasswordTokenValidConstraint).toBeDefined();
        expect(resetPasswordTokenValidConstraint).toBeInstanceOf(ResetPasswordTokenValidConstraint);
        expect(usersCommand).toBeDefined();
        expect(usersCommand).toBeInstanceOf(UsersCommand);
    });

    it('should load user config', async () => {
        module = await createTestingModule({
            imports: [
                CoreModule.forRoot(),
                UserModule,
            ]
        });

        const config = userConfig();
        const service = module.get(ConfigService);

        Object.keys(config)
            .forEach((key) => {
                expect(service.get(key)).toEqual(config[key]);
            });
    });

    it('should register entities in the module', async () => {
        module = await createTestingModule({
            imports: [
                CoreModule.forRoot(),
                UserModule,
            ]
        });

        const dataSource = module.get(DataSource);

        const userRepository = dataSource.getRepository(User);
        const groupRepository = dataSource.getRepository(Group);
        const permissionRepository = dataSource.getRepository(Permission);

        expect(userRepository).toBeDefined();
        expect(groupRepository).toBeDefined();
        expect(permissionRepository).toBeDefined();
    });
});
