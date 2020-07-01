import { registerAs } from '../config/property-config.utils';

export default registerAs('server', () => ({
    port: Number(process.env.PORT) || 8000,
}));
