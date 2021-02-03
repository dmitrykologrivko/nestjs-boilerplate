export default () => ({
    http: {
        server: {
            port: Number(process.env.PORT) || 8000,
        },
    },
});
