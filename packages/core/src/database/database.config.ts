export default () => ({
    databases: [{
        type: 'sqlite',
        database: 'database',
        autoLoadEntities: true,
        synchronize: true,
    }],
});
