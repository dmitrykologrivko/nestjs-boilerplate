import { validate, Validate, IsString, useContainer } from 'class-validator';
import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { UserPasswordService } from '../../services/user-password.service';
import { ResetPasswordTokenValidConstraint } from '../../validation/reset-password-token-valid.constraint';

describe('ResetPasswordTokenValidConstraint (Integration)', () => {
    class TestDto {
        @IsString()
        @Validate(ResetPasswordTokenValidConstraint)
        resetToken: string;
    }

    let mockService: MockProxy<UserPasswordService>;
    let moduleRef: TestingModule;

    beforeEach(async () => {
        mockService = mock<UserPasswordService>();
        moduleRef = await Test.createTestingModule({
            providers: [
                ResetPasswordTokenValidConstraint,
                { provide: UserPasswordService, useValue: mockService },
            ],
        }).compile();

        useContainer(moduleRef, { fallbackOnErrors: true });
    });

    it('should pass validation if reset token is valid', async () => {
        const dto = new TestDto();
        dto.resetToken = 'valid-token';

        mockService.isResetPasswordTokenValid.mockResolvedValue(true);

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(mockService.isResetPasswordTokenValid).toHaveBeenCalledWith('valid-token');
    });

    it('should fail validation if reset token is not valid', async () => {
        const dto = new TestDto();
        dto.resetToken = 'invalid-token';

        mockService.isResetPasswordTokenValid.mockResolvedValue(false);

        const errors = await validate(dto);

        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toBeDefined();
        expect(Object.values(errors[0].constraints)[0]).toContain('Reset password token is not valid');
        expect(mockService.isResetPasswordTokenValid).toHaveBeenCalledWith('invalid-token');
    });
});
