const path = require('path');

module.exports = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      database: 'cashflow_tracker',
      user: 'postgres',
      password: 'password'
    },
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  },
  
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    },
    pool: {
      min: 2,
      max: 10
    }
  },
  
  // For offline sync
  sync: {
    client: 'sqlite3',
    connection: {
      filename: './local_sync.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations/sync')
    }
  }
};
