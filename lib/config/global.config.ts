export default () => ({
    debug: Boolean(process.env.DEBUG) || false,
    secretKey: process.env.SECRET_KEY,
});
