import { validate, Validate, IsString, useContainer } from 'class-validator';
import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { UserVerificationService } from '../../services/user-verification.service';
import { UsernameExistsConstraint } from '../../validation/username-exists.constraint';

describe('UsernameExistsConstraint (Integration)', () => {
    class TestDto {
        @IsString()
        @Validate(UsernameExistsConstraint)
        username: string;
    }

    let mockService: MockProxy<UserVerificationService>;
    let moduleRef: TestingModule;

    beforeEach(async () => {
        mockService = mock<UserVerificationService>();
        moduleRef = await Test.createTestingModule({
            providers: [
                UsernameExistsConstraint,
                { provide: UserVerificationService, useValue: mockService },
            ],
        }).compile();

        useContainer(moduleRef, { fallbackOnErrors: true });
    });

    it('should pass validation if username does not exist', async () => {
        const dto = new TestDto();
        dto.username = 'valid-username';

        mockService.isUsernameExists.mockResolvedValue(true);

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(mockService.isUsernameExists).toHaveBeenCalledWith('valid-username');
    });

    it('should fail validation if username exists', async () => {
        const dto = new TestDto();
        dto.username = 'existing-username';

        mockService.isUsernameExists.mockResolvedValue(false);

        const errors = await validate(dto);

        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toBeDefined();
        expect(Object.values(errors[0].constraints)[0]).toContain('User with this username does not exist');
        expect(mockService.isUsernameExists).toHaveBeenCalledWith('existing-username');
    });
});
