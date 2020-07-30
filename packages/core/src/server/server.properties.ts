import { ConnectionOptions } from './connection-options.interface';
import { Property } from '../config/property.interface';

export const SERVER_PROPERTY: Property<ConnectionOptions> = { path: 'server' };
export const SERVER_PORT_PROPERTY: Property<number> = { path: 'server.port', defaultValue: 8000 };
