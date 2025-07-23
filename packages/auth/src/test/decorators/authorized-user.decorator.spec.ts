import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Get } from '@nestjs/common';
import { AuthorizedUser } from '../../decorators/authorized-user.decorator';

describe('AuthorizedUser Decorator (Integration)', () => {
  @Controller()
  class TestController {
    @Get('me')
    getMe(@AuthorizedUser() user: any) {
      return user;
    }
  }

  let app: INestApplication;
  const mockUser = {
    id: '123',
    username: 'testuser'
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication();
    // Inject user into request for all routes
    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should inject user from request using AuthorizedUser decorator', async () => {
    const response = await request(app.getHttpServer())
        .get('/me')
        .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });
});
