require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { sslmode: 'require' },
});

pool.connect()
  .then(() => {
    console.log('Connected to the database');
    return pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);
  })
  .then(() => {
    return pool.query(`
      CREATE TABLE IF NOT EXISTS videogame (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        released DATE,
        rating FLOAT CHECK (rating >= 1.0 AND rating <= 5.0),
        platforms TEXT[] NOT NULL,
        background_image TEXT NOT NULL,
        createdInDb BOOLEAN NOT NULL DEFAULT true
      );
    `);
  })
  .then(() => {
    console.log('Tables created successfully');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = pool;
