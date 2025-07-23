import { validate, Validate, IsString, useContainer } from 'class-validator';
import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { UserPasswordService } from '../../services/user-password.service';
import { PasswordMatchConstraint } from '../../validation/password-match.constraint';

describe('PasswordMatchConstraint (Integration)', () => {
    class TestDto {
        userId: number;

        @IsString()
        @Validate(PasswordMatchConstraint)
        password: string;
    }

    let mockService: MockProxy<UserPasswordService>;
    let moduleRef: TestingModule;

    beforeEach(async () => {
        mockService = mock<UserPasswordService>();
        moduleRef = await Test.createTestingModule({
            providers: [
                PasswordMatchConstraint,
                { provide: UserPasswordService, useValue: mockService },
            ],
        }).compile();

        useContainer(moduleRef, { fallbackOnErrors: true });
    });

    it('should pass validation if password matches', async () => {
        const dto = new TestDto();
        dto.userId = 1;
        dto.password = 'correct-password';

        mockService.comparePassword.mockResolvedValue(true);

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(mockService.comparePassword).toHaveBeenCalledWith(1, 'correct-password');
    });

    it('should fail validation if password does not match', async () => {
        const dto = new TestDto();
        dto.userId = 1;
        dto.password = 'wrong-password';

        mockService.comparePassword.mockResolvedValue(false);

        const errors = await validate(dto);

        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toBeDefined();
        expect(Object.values(errors[0].constraints)[0]).toContain('Does not match with current user password');
        expect(mockService.comparePassword).toHaveBeenCalledWith(1, 'wrong-password');
    });

    it('should fail validation if userId is missing', async () => {
        const dto = new TestDto();
        dto.password = 'any-password';

        const errors = await validate(dto);

        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toBeDefined();
        expect(Object.values(errors[0].constraints)[0]).toContain('Does not match with current user password');
        expect(mockService.comparePassword).not.toHaveBeenCalled();
    });

    it('should fail validation if password is missing', async () => {
        const dto = new TestDto();
        dto.userId = 1;

        const errors = await validate(dto);

        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toBeDefined();
        expect(Object.values(errors[0].constraints)[0]).toContain('password must be a string');
        expect(mockService.comparePassword).not.toHaveBeenCalled();
    });
});
