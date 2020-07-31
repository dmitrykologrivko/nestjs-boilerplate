import { User } from '../../entities/user.entity';

export class UserFactory {

    static DEFAULT_USERNAME = 'john_smith';
    static DEFAULT_PASSWORD = '12345678';

    static async makeUser(id: number = 1) {
        const createUserResult = await User.create(
          UserFactory.DEFAULT_USERNAME,
          UserFactory.DEFAULT_PASSWORD,
          'test@test.com',
          'John',
          'Smith',
          true,
          false,
          false,
        );

        const user = createUserResult.unwrap();

        user.id = id;
        user.created = new Date();
        user.updated = new Date();

        return user;
    }
}
