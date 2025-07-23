import {
    DataSource,
    Repository,
    Entity,
    Column,
} from 'typeorm';
import { BaseValueObject } from '../../../domain/entities/base.value-object';
import { BaseTypeormEntity } from '../../../application/entities/base-typeorm.entity';
import { BaseElement } from '../../../application/entities/base.element';
import { Element } from '../../../application/entities/element.decorator';
import { ElementCollection } from '../../../application/entities/element-collection.decorator';
import { SingleElement } from '../../../application/entities/single-element.decorator';
import { Embedded } from '../../../application/entities/embedded.decorator';

describe('Entity Decorators (Integration)', () => {
    describe('Element and SingleElement decorators', () => {
        // tslint:disable-next-line:max-classes-per-file
        @Element({ single: true, parent: () => Person })
        class Address extends BaseElement<Person> {
            @Column()
            address1: string;

            @Column()
            address2: string;

            @Column()
            zipCode: string;

            @Column()
            city: string;

            @Column()
            country: string;
        }

        // tslint:disable-next-line:max-classes-per-file
        @Entity()
        class Person extends BaseTypeormEntity {
            @Column()
            name!: string;

            @SingleElement<Address>(() => Address)
            address: Address;
        }

        let dataSource: DataSource;
        let personRepository: Repository<Person>;

        beforeAll(async () => {
            dataSource = new DataSource({
                type: 'sqlite',
                database: ':memory:',
                synchronize: true,
                entities: [Person, Address],
            });
            await dataSource.initialize();

            personRepository = dataSource.getRepository(Person);
        });

        afterAll(async () => {
            await dataSource.destroy();
        });

        it('should create and retrieve a relationship', async () => {
            let person = personRepository.create({ name: 'Person 1' });
            const address = new Address();
            address.address1 = 'Street 1';
            address.address2 = 'Apt 2';
            address.zipCode = '12345';
            address.city = 'City';
            address.country = 'US';

            person.address = address;

            await personRepository.save(person);

            person = await personRepository.findOne({ where: { id: person.id } });

            expect(person).toBeDefined();
            expect(person?.address).toBeDefined();
            expect(person?.address.address1).toBe(address.address1);
            expect(person?.address.address2).toBe(address.address2);
            expect(person?.address.zipCode).toBe(address.zipCode);
            expect(person?.address.city).toBe(address.city);
            expect(person?.address.country).toBe(address.country);
        });
    });

    describe('Element and ElementCollection decorators', () => {
        // tslint:disable-next-line:max-classes-per-file
        @Element({ parent: () => Person })
        class Address extends BaseElement<Person> {
            @Column()
            address1: string;

            @Column()
            address2: string;

            @Column()
            zipCode: string;

            @Column()
            city: string;

            @Column()
            country: string;
        }

        // tslint:disable-next-line:max-classes-per-file
        @Entity()
        class Person extends BaseTypeormEntity {
            @Column()
            name!: string;

            @ElementCollection<Address>(() => Address)
            addresses: Address[];
        }

        let dataSource: DataSource;
        let personRepository: Repository<Person>;

        beforeAll(async () => {
            dataSource = new DataSource({
                type: 'sqlite',
                database: ':memory:',
                synchronize: true,
                entities: [Person, Address],
            });
            await dataSource.initialize();

            personRepository = dataSource.getRepository(Person);
        });

        afterAll(async () => {
            await dataSource.destroy();
        });

        it('should create and retrieve a relationship', async () => {
            let person = personRepository.create({ name: 'Person 1' });

            const address1 = new Address();
            address1.address1 = 'Street 1';
            address1.address2 = 'Apt 2';
            address1.zipCode = '12345';
            address1.city = 'City';
            address1.country = 'US';

            const address2 = new Address();
            address2.address1 = 'Street 2';
            address2.address2 = 'Apt 3';
            address2.zipCode = '12345678';
            address2.city = 'City 2';
            address2.country = 'CN';

            person.addresses = [
                address1,
                address2,
            ];

            await personRepository.save(person);

            person = await personRepository.findOne({ where: { id: person.id } });

            expect(person).toBeDefined();
            expect(person?.addresses).toBeDefined();
            expect(person?.addresses).toHaveLength(2);
            expect(person?.addresses[0].address1).toBe(address1.address1);
            expect(person?.addresses[0].address2).toBe(address1.address2);
            expect(person?.addresses[0].zipCode).toBe(address1.zipCode);
            expect(person?.addresses[0].city).toBe(address1.city);
            expect(person?.addresses[1].country).toBe(address2.country);
            expect(person?.addresses[1].address1).toBe(address2.address1);
            expect(person?.addresses[1].address2).toBe(address2.address2);
            expect(person?.addresses[1].zipCode).toBe(address2.zipCode);
            expect(person?.addresses[1].city).toBe(address2.city);
            expect(person?.addresses[1].country).toBe(address2.country);
        });
    });

    describe('Embedded decorator', () => {
        // tslint:disable-next-line:max-classes-per-file
        class Address extends BaseValueObject {
            @Column()
            address1: string;

            @Column()
            address2: string;

            @Column()
            zipCode: string;

            @Column()
            city: string;

            @Column()
            country: string;
        }

        // tslint:disable-next-line:max-classes-per-file
        @Entity()
        class Person extends BaseTypeormEntity {
            @Column()
            name!: string;

            @Embedded(() => Address)
            address: Address;
        }

        let dataSource: DataSource;
        let personRepository: Repository<Person>;

        beforeAll(async () => {
            dataSource = new DataSource({
                type: 'sqlite',
                database: ':memory:',
                synchronize: true,
                entities: [Person, Address],
            });
            await dataSource.initialize();

            personRepository = dataSource.getRepository(Person);
        });

        afterAll(async () => {
            await dataSource.destroy();
        });

        it('should create and retrieve a relationship', async () => {
            let person = personRepository.create({ name: 'Person 1' });
            const address = new Address();
            address.address1 = 'Street 1';
            address.address2 = 'Apt 2';
            address.zipCode = '12345';
            address.city = 'City';
            address.country = 'US';

            person.address = address;

            await personRepository.save(person);

            person = await personRepository.findOne({ where: { id: person.id } });

            expect(person).toBeDefined();
            expect(person?.address).toBeDefined();
            expect(person?.address.address1).toBe(address.address1);
            expect(person?.address.address2).toBe(address.address2);
            expect(person?.address.zipCode).toBe(address.zipCode);
            expect(person?.address.city).toBe(address.city);
            expect(person?.address.country).toBe(address.country);
        });
    });
});
