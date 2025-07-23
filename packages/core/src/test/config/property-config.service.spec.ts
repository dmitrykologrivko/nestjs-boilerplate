import { ConfigService } from '@nestjs/config';
import { mock, MockProxy } from 'jest-mock-extended';
import { PropertyConfigService } from '../../config/property-config.service';
import { Property } from '../../config/property.interface';

describe('PropertyConfigService', () => {
    let service: PropertyConfigService;
    let configService: MockProxy<ConfigService>;

    beforeEach(() => {
        configService = mock<ConfigService>();
        configService.get.mockImplementation((path: string, defaultValue?: any) => {
            if (path === 'app.name') {
                return 'myAppName';
            } else if (path === 'app.port') {
                return 8080;
            }
            return defaultValue;
        });

        service = new PropertyConfigService(configService);
    });

    describe('#get', () => {
        it('returns the value from ConfigService when property exists', () => {
            const property: Property<string> = { path: 'app.name', defaultValue: 'defaultAppName' };

            const result = service.get(property);

            expect(result).toBe('myAppName');
            expect(configService.get).toHaveBeenCalledWith(property.path, property.defaultValue);
        });

        it('returns the default value when property does not exist', () => {
            const property: Property<string> = { path: 'app.name2', defaultValue: 'defaultAppName' };

            const result = service.get(property);

            expect(result).toBe('defaultAppName');
            expect(configService.get).toHaveBeenCalledWith(property.path, property.defaultValue);
        });

        it('returns undefined when no default value is provided and property does not exist', () => {
            const property: Property<string> = { path: 'app.name3', defaultValue: undefined };

            const result = service.get(property);

            expect(result).toBeUndefined();
            expect(configService.get).toHaveBeenCalledWith(property.path, property.defaultValue);
        });

        it('handles non-string property values correctly', () => {
            const property: Property<number> = { path: 'app.port', defaultValue: 3000 };

            const result = service.get(property);

            expect(result).toBe(8080);
            expect(configService.get).toHaveBeenCalledWith(property.path, property.defaultValue);
        });
    });
});