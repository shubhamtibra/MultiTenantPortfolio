require('dotenv').config();

module.exports = {
    development: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectModule: require('pg'),
        logging: false,
        pool: {
            max: 10,
        },
    },
    test: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectModule: require('pg'),
        logging: false,
        pool: {
            max: 10,
        },
    },
    production: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectModule: require('pg'),
        logging: false,
        pool: {
            max: 10,
        },
    }
};
