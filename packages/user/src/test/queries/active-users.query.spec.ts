import { ActiveUsersQuery } from '../../queries/active-users.query';

describe('ActiveUsersQuery', () => {
    describe('#toFindOneOptions()', () => {
        it('should return query object', () => {
            const query = new ActiveUsersQuery({ username: 'john' });

            const options = query.toFindOneOptions();

            expect(options.where).toEqual({
                username: 'john',
                isActive: true
            });
        });
    });

    describe('#toFindManyOptions()', () => {
        it('should return the same query object as for toFindOneOptions', () => {
            const query = new ActiveUsersQuery({ email: 'test@example.com' });
            expect(query.toFindManyOptions()).toEqual(query.toFindOneOptions());
        });
    });
});
