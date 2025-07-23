import * as request from 'supertest';
import {
    INestApplication,
    Controller,
    Post,
    Body,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsString, IsNotEmpty } from 'class-validator';
import { ValidationExceptionsPipe } from '../../../web/pipes/validation-exceptions.pipe';

describe('ValidationExceptionsPipe (Integration)', () => {
    class TestDto {
        @IsString()
        @IsNotEmpty()
        name: string;
    }

    @Controller('test')
    class TestController {
        @Post()
        testEndpoint(@Body() body: TestDto): string {
            return 'Valid';
        }
    }

    let app: INestApplication;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TestController],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationExceptionsPipe({}));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return 400 with validation errors for invalid input', async () => {
        const response = await request(app.getHttpServer())
            .post('/test')
            .send({ invalidField: 'value' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBeInstanceOf(Array);
        expect(response.body.message[0]).toHaveProperty('property', 'name');
    });

    it('should return 201 for valid input', async () => {
        const response = await request(app.getHttpServer())
            .post('/test')
            .send({ name: 'Valid Name' });

        expect(response.status).toBe(201);
        expect(response.text).toBe('Valid');
    });
});
