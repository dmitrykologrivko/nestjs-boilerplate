import { validate, IsEmail, Validate, useContainer } from 'class-validator';
import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { UserVerificationService } from '../../services/user-verification.service';
import { EmailActiveConstraint } from '../../validation/email-active.constraint';

describe('EmailActiveConstraint (Integration)', () => {
    class TestDto {
        @IsEmail()
        @Validate(EmailActiveConstraint)
        email: string;
    }

    let mockService: MockProxy<UserVerificationService>;
    let moduleRef: TestingModule;

    beforeEach(async () => {
        mockService = mock<UserVerificationService>();
        moduleRef = await Test.createTestingModule({
            providers: [
                EmailActiveConstraint,
                { provide: UserVerificationService, useValue: mockService },
            ],
        }).compile();

        useContainer(moduleRef, { fallbackOnErrors: true });
    });

    it('should pass validation for active email', async () => {
        const dto = new TestDto();
        dto.email = 'active@example.com';

        mockService.isEmailActive.mockResolvedValue(true);

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(mockService.isEmailActive).toHaveBeenCalledWith('active@example.com');
    });

    it('should fail validation for inactive email', async () => {
        const dto = new TestDto();
        dto.email = 'inactive@example.com';

        mockService.isEmailActive.mockResolvedValue(false);

        const errors = await validate(dto);

        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toBeDefined();
        expect(Object.values(errors[0].constraints)[0]).toContain('Email is not found');
        expect(mockService.isEmailActive).toHaveBeenCalledWith('inactive@example.com');
    });
});
