import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Property } from './property.interface';

/**
 * Property Adapter class for NestJS Config Service
 */
@Injectable()
export class PropertyConfigService {
    constructor(private readonly configService: ConfigService) {}

    get<T>(property: Property<T>): T | undefined {
        return this.configService.get<T>(property.path, property.defaultValue);
    }
}
