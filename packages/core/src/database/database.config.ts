export default () => ({
    databases: {
        default: {
            type: 'sqlite',
            database: 'database',
            autoLoadEntities: true,
            synchronize: true,
        },
    },
});
