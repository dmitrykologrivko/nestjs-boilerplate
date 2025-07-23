export default () => ({
    debug: true,
    secretKey: 'FAD3AE7BC1A37BA3A85696ABC6844',
    database: {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true
    }
});
