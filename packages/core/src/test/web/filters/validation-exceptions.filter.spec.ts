import * as request from 'supertest';
import {
    INestApplication,
    Controller,
    Post,
    UseFilters,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationExceptionsFilter } from '../../../web/filters/validation-exceptions.filter';
import { ValidationException } from '../../../utils/validation/validation.exception';
import { NonFieldValidationException } from '../../../utils/validation/non-field-validation.exception';

describe('ValidationExceptionsFilter (Integration)', () => {
    @Controller('validation')
    @UseFilters(ValidationExceptionsFilter)
    class TestController {
        @Post('exception')
        exceptionEndpoint(): string {
            throw new ValidationException(
                'name',
                'this is a test',
                {
                    'name': 'Valid name is required',
                },
                []
            );
        }

        @Post('non-field-exception')
        nonFiledExceptionEndpoint(): string {
            throw new NonFieldValidationException({
                'invalidCredentials': 'Invalid credentials',
            });
        }
    }

    let app: INestApplication;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TestController],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return 400 with proper error response when ValidationException is thrown', async () => {
        const response = await request(app.getHttpServer())
            .post('/validation/exception')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            statusCode: 400,
            error: 'Bad Request',
            message: [
                {
                    property: 'name',
                    value: 'this is a test',
                    constraints: {
                        name: 'Valid name is required',
                    },
                    children: [],
                },
            ],
        });
    });

    it('should return 400 with proper error response when NonFieldValidationException is thrown', async () => {
        const response = await request(app.getHttpServer())
            .post('/validation/non-field-exception')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            statusCode: 400,
            error: 'Bad Request',
            message: [
                {
                    property: 'nonFieldErrors',
                    value: null,
                    constraints: {
                        invalidCredentials: 'Invalid credentials',
                    },
                    children: [],
                },
            ],
        });
    });
});