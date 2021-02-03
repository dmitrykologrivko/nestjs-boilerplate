import { ConnectionOptions } from '../server/connection-options.interface';
import { Property } from '../../config/property.interface';

export const HTTP_SERVER_PROPERTY: Property<ConnectionOptions> = { path: 'http.server' };
export const HTTP_SERVER_PORT_PROPERTY: Property<number> = { path: 'http.server.port', defaultValue: 8000 };
