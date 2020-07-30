import { Property } from './property.interface';

export const DEBUG_PROPERTY: Property<boolean> = { path: 'debug', defaultValue: false };
export const SECRET_KEY_PROPERTY: Property<string> = { path: 'secretKey' };
