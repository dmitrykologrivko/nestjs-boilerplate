import { Injectable } from '@nestjs/common';
import {
    instanceToPlain,
    instanceToInstance,
    plainToInstance,
    ClassTransformOptions,
} from 'class-transformer';
import { Constructor } from './type.utils';

/**
 * Class transformer util
 * Wrapper on "class-transformer" library
 */
@Injectable()
export class ClassTransformer {

    /**
     * Map plain (literal) object to class (constructor) object
     * @param cls class construction function
     * @param plain literal object
     * @param options "class-transformer" library options
     * @returns {T} class (constructor) object
     */
    static toClassObject<T, V>(cls: Constructor<T>, plain: V, options?: ClassTransformOptions): T {
        return plainToInstance(cls, plain, options);
    }

    /**
     * Map array of plain (literal) objects to array of class (constructor) objects
     * @param cls class construction function
     * @param plain array of objects
     * @param options "class-transformer" library options
     * @return array of class (constructor) objects
     */
    static toClassObjects<T, V>(cls: Constructor<T>, plain: V[], options?: ClassTransformOptions): T[] {
        return plainToInstance(cls, plain, options);
    }

    /**
     * Converts class (constructor) objects to plain (literal) object
     * @param object class construction instance
     * @param options "class-transformer" library options
     * @return plain (literal) object
     */
    static toLiteralObject<T>(object: T, options?: ClassTransformOptions): object {
        return instanceToPlain(object, options);
    }

    /**
     * Converts array of class (constructor) objects to array of plain (literal) objects
     * @param object array of class (constructor) objects
     * @param options "class-transformer" library options
     * @return array of plain (literal) objects
     */
    static toLiteralObjects<T>(object: T[], options?: ClassTransformOptions): object[] {
        return instanceToPlain(object, options) as object[];
    }

    /**
     * Deep copy (clone) class (constructor) object
     * @param object object to copy
     * @param options "class-transformer" library options
     * @return copy of provided object
     */
    static copyObject<T>(object: T, options?: ClassTransformOptions): T {
        return instanceToInstance(object, options);
    }

    /**
     * Deep copy (clone) array of class (constructor) objects
     * @param object array of objects to copy
     * @param options "class-transformer" library options
     * @return array of copies of provided objects
     */
    static copyObjects<T>(object: T[], options?: ClassTransformOptions): T[] {
        return instanceToInstance(object, options);
    }

    /**
     * Map plain (literal) object to class (constructor) object
     * @param cls class construction function
     * @param plain literal object
     * @param options "class-transformer" library options
     * @returns {T} class (constructor) object
     */
    toClassObject<T, V>(cls: Constructor<T>, plain: V, options?: ClassTransformOptions): T {
        return ClassTransformer.toClassObject(cls, plain, options);
    }

    /**
     * Map array of plain (literal) objects to array of class (constructor) objects
     * @param cls class construction function
     * @param plain array of objects
     * @param options "class-transformer" library options
     * @return array of class (constructor) objects
     */
    toClassObjects<T, V>(cls: Constructor<T>, plain: V[], options?: ClassTransformOptions): T[] {
        return ClassTransformer.toClassObjects(cls, plain, options);
    }

    /**
     * Converts class (constructor) objects to plain (literal) object
     * @param object class construction instance
     * @param options "class-transformer" library options
     * @return plain (literal) object
     */
    toLiteralObject<T>(object: T, options?: ClassTransformOptions): object {
        return ClassTransformer.toLiteralObject(object, options);
    }

    /**
     * Converts array of class (constructor) objects to array of plain (literal) objects
     * @param object array of class (constructor) objects
     * @param options "class-transformer" library options
     * @return array of plain (literal) objects
     */
    toLiteralObjects<T>(object: T[], options?: ClassTransformOptions): object[] {
        return ClassTransformer.toLiteralObjects(object, options);
    }

    /**
     * Deep copy (clone) class (constructor) object
     * @param object object to copy
     * @param options "class-transformer" library options
     * @return copy of provided object
     */
    copyObject<T>(object: T, options?: ClassTransformOptions): T {
        return ClassTransformer.copyObject(object, options);
    }

    /**
     * Deep copy (clone) array of class (constructor) objects
     * @param object array of objects to copy
     * @param options "class-transformer" library options
     * @return array of copies of provided objects
     */
    copyObjects<T>(object: T[], options?: ClassTransformOptions): T[] {
        return ClassTransformer.copyObjects(object, options);
    }
}
