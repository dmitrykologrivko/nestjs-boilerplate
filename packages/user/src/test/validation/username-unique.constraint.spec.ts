import { validate, Validate, IsString, useContainer } from 'class-validator';
import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { UserVerificationService } from '../../services/user-verification.service';
import { UsernameUniqueConstraint } from '../../validation/username-unique.constraint';

describe('UsernameUniqueConstraint (Integration)', () => {
    class TestDto {
        @IsString()
        @Validate(UsernameUniqueConstraint)
        username: string;
    }

    let mockService: MockProxy<UserVerificationService>;
    let moduleRef: TestingModule;

    beforeEach(async () => {
        mockService = mock<UserVerificationService>();
        moduleRef = await Test.createTestingModule({
            providers: [
                UsernameUniqueConstraint,
                { provide: UserVerificationService, useValue: mockService },
            ],
        }).compile();

        useContainer(moduleRef, { fallbackOnErrors: true });
    });

    it('should pass validation if username is unique', async () => {
        const dto = new TestDto();
        dto.username = 'unique-username';

        mockService.isUsernameUnique.mockResolvedValue(true);

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(mockService.isUsernameUnique).toHaveBeenCalledWith('unique-username');
    });

    it('should fail validation if username is not unique', async () => {
        const dto = new TestDto();
        dto.username = 'non-unique-username';

        mockService.isUsernameUnique.mockResolvedValue(false);

        const errors = await validate(dto);

        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toBeDefined();
        expect(Object.values(errors[0].constraints)[0]).toContain('User with this username already exists');
        expect(mockService.isUsernameUnique).toHaveBeenCalledWith('non-unique-username');
    });
});
