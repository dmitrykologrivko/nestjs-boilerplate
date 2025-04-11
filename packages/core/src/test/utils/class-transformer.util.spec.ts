import { ClassTransformer } from '../../utils/class-transformer.util';

describe('ClassTransformer', () => {
    let classTransformer: ClassTransformer;

    class TestClass {
        id!: number;
        name!: string;
    }

    beforeEach(() => {
        classTransformer = new ClassTransformer();
    });

    describe('#toClassObject', () => {
        it('(static) should map plain object to class object correctly', () => {
            const plain = { id: 1, name: 'Test' };

            const result = ClassTransformer.toClassObject(TestClass, plain);

            expect(result).toBeInstanceOf(TestClass);
            expect(result.id).toEqual(1);
            expect(result.name).toEqual('Test');
        });

        it('(instance) should map plain object to class object correctly', () => {
            const plain = { id: 1, name: 'Test' };

            const result = classTransformer.toClassObject(TestClass, plain);

            expect(result).toBeInstanceOf(TestClass);
            expect(result.id).toEqual(1);
            expect(result.name).toEqual('Test');
        });
    });

    describe('#toClassObjects', () => {
        it('(static) should map array of plain object to class object correctly', () => {
            const plain = [
                { id: 1, name: 'Test' },
                { id: 2, name: 'Test2' },
            ];

            const result = ClassTransformer.toClassObjects(TestClass, plain);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toEqual(2);
            expect(result[0].id).toEqual(1);
            expect(result[0].name).toEqual('Test');
            expect(result[1].id).toEqual(2);
            expect(result[1].name).toEqual('Test2');
        });

        it('(instance) should map array of plain object to class object correctly', () => {
            const plain = [
                { id: 1, name: 'Test' },
                { id: 2, name: 'Test2' },
            ];

            const result = classTransformer.toClassObjects(TestClass, plain);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toEqual(2);
            expect(result[0].id).toEqual(1);
            expect(result[0].name).toEqual('Test');
            expect(result[1].id).toEqual(2);
            expect(result[1].name).toEqual('Test2');
        });
    });

    describe('#toLiteralObject', () => {
        it('(static) should map class instance to plain object correctly', () => {
            const instance = new TestClass();
            instance.id = 1;
            instance.name = 'Test';

            const result: Partial<TestClass> = ClassTransformer.toLiteralObject<TestClass>(instance);

            expect(typeof result === 'object').toBeTruthy();
            expect(result.id).toEqual(1);
            expect(result.name).toEqual('Test');
        });

        it('(instance) should map class instance to plain object correctly', () => {
            const instance = new TestClass();
            instance.id = 1;
            instance.name = 'Test';

            const result: Partial<TestClass> = classTransformer.toLiteralObject<TestClass>(instance);

            expect(typeof result === 'object').toBeTruthy();
            expect(result.id).toEqual(1);
            expect(result.name).toEqual('Test');
        });
    });

    describe('#toLiteralObjects', () => {
        it('(static) should map array of class instances to plain objects correctly', () => {
            const instance = new TestClass();
            instance.id = 1;
            instance.name = 'Test';

            const instance2 = new TestClass();
            instance2.id = 2;
            instance2.name = 'Test2';

            const instances = [instance, instance2];

            const result: Partial<TestClass>[] = ClassTransformer.toLiteralObjects<TestClass>(instances);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toEqual(2);
            expect(typeof result === 'object').toBeTruthy();
            expect(result[0].id).toEqual(1);
            expect(result[0].name).toEqual('Test');
            expect(result[1].id).toEqual(2);
            expect(result[1].name).toEqual('Test2');
        });

        it('(instance) should map array of class instance to plain objects correctly', () => {
            const instance = new TestClass();
            instance.id = 1;
            instance.name = 'Test';

            const instance2 = new TestClass();
            instance2.id = 2;
            instance2.name = 'Test2';

            const instances = [instance, instance2];

            const result: Partial<TestClass>[] = classTransformer.toLiteralObjects<TestClass>(instances);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toEqual(2);
            expect(typeof result === 'object').toBeTruthy();
            expect(result[0].id).toEqual(1);
            expect(result[0].name).toEqual('Test');
            expect(result[1].id).toEqual(2);
            expect(result[1].name).toEqual('Test2');
        });
    });

    describe('#copyObject', () => {
        it('(static) should copy object correctly', () => {
            const instance = new TestClass();
            instance.id = 1;
            instance.name = 'Test';

            const result = ClassTransformer.copyObject<TestClass>(instance);

            expect(result).toBeInstanceOf(TestClass);
            expect(result.id).toEqual(1);
            expect(result.name).toEqual('Test');
        });

        it('(instance) should copy object correctly', () => {
            const instance = new TestClass();
            instance.id = 1;
            instance.name = 'Test';

            const result = classTransformer.copyObject<TestClass>(instance);

            expect(result).toBeInstanceOf(TestClass);
            expect(result.id).toEqual(1);
            expect(result.name).toEqual('Test');
        });
    });

    describe('#copyObjects', () => {
        it('(static) should copy array of objects correctly', () => {
            const instance = new TestClass();
            instance.id = 1;
            instance.name = 'Test';

            const instance2 = new TestClass();
            instance2.id = 2;
            instance2.name = 'Test2';

            const instances = [instance, instance2];

            const result = ClassTransformer.copyObjects<TestClass>(instances);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toEqual(2);
            expect(result[0]).toBeInstanceOf(TestClass);
            expect(result[0].id).toEqual(1);
            expect(result[0].name).toEqual('Test');
            expect(result[1]).toBeInstanceOf(TestClass);
            expect(result[1].id).toEqual(2);
            expect(result[1].name).toEqual('Test2');
        });

        it('(instance) should copy array of objects correctly', () => {
            const instance = new TestClass();
            instance.id = 1;
            instance.name = 'Test';

            const instance2 = new TestClass();
            instance2.id = 2;
            instance2.name = 'Test2';

            const instances = [instance, instance2];

            const result = classTransformer.copyObjects<TestClass>(instances);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toEqual(2);
            expect(result[0]).toBeInstanceOf(TestClass);
            expect(result[0].id).toEqual(1);
            expect(result[0].name).toEqual('Test');
            expect(result[1]).toBeInstanceOf(TestClass);
            expect(result[1].id).toEqual(2);
            expect(result[1].name).toEqual('Test2');
        });
    });
});
