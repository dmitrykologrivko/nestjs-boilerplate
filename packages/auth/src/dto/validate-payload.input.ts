export class ValidatePayloadInput {
    payload: {
        username: string,
        sub: number,
        jti: string,
        iat: number,
        exp: number,
    };
}
