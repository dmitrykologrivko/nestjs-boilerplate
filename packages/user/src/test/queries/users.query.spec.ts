import { UsersQuery } from '../../queries/users.query';

describe('UsersQuery', () => {
  describe('#toFindOneOptions()', () => {
    it('should return query object', () => {
      const query = new UsersQuery({
        id: 1,
        username: 'john',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isAdmin: true,
        isSuperuser: false,
        isActive: true,
      });

      const options = query.toFindOneOptions();

      expect(options.where).toEqual({
        id: 1,
        username: 'john',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isAdmin: true,
        isActive: true,
      });
    });
  });

  describe('#toFindManyOptions()', () => {
    it('should return the same query object as for toFindOneOptions', () => {
      const query = new UsersQuery({ email: 'test@example.com' });
      expect(query.toFindManyOptions()).toEqual(query.toFindOneOptions());
    });
  });
});

