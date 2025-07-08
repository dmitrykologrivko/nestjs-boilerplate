import { validate, IsEmail, Validate, useContainer } from 'class-validator';
import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { UserVerificationService } from '../../services/user-verification.service';
import { EmailUniqueConstraint } from '../../validation/email-unique.constraint';

describe('EmailUniqueConstraint (Integration)', () => {
    class TestDto {
        @IsEmail()
        @Validate(EmailUniqueConstraint)
        email: string;
    }

    let mockService: MockProxy<UserVerificationService>;
    let moduleRef: TestingModule;

    beforeEach(async () => {
        mockService = mock<UserVerificationService>();
        moduleRef = await Test.createTestingModule({
            providers: [
                EmailUniqueConstraint,
                { provide: UserVerificationService, useValue: mockService },
            ],
        }).compile();

        useContainer(moduleRef, { fallbackOnErrors: true });
    });

    it('should pass validation for unique email', async () => {
        const dto = new TestDto();
        dto.email = 'unique@example.com';

        mockService.isEmailUnique.mockResolvedValue(true);

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(mockService.isEmailUnique).toHaveBeenCalledWith('unique@example.com');
    });

    it('should fail validation for non unique email', async () => {
        const dto = new TestDto();
        dto.email = 'nonunique@example.com';

        mockService.isEmailUnique.mockResolvedValue(false);

        const errors = await validate(dto);

        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toBeDefined();
        expect(Object.values(errors[0].constraints)[0]).toContain('User with this email already exists');
        expect(mockService.isEmailUnique).toHaveBeenCalledWith('nonunique@example.com');
    });
});
