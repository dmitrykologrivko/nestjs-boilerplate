import {
    PRODUCTION_ENVIRONMENT,
    DEVELOPMENT_ENVIRONMENT,
    TEST_ENVIRONMENT,
} from './environment.constants';

export function isProductionEnvironment() {
    return process.env.NODE_ENV === PRODUCTION_ENVIRONMENT;
}

export function isDevelopmentEnvironment() {
    return !process.env.NODE_ENV || process.env.NODE_ENV === DEVELOPMENT_ENVIRONMENT;
}

export function isTestEnvironment() {
    return process.env.NODE_ENV === TEST_ENVIRONMENT;
}
