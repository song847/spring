const { getDb, closeDb, initDb } = require('../src/db');

describe('Database Initialization', () => {
  let db;

  beforeAll((done) => {
    initDb(':memory:', (err) => {
      if (err) return done(err);
      db = getDb();
      done();
    });
  });

  afterAll((done) => {
    closeDb(done);
  });

  test('creates users table', () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    expect(row).toBeDefined();
    expect(row.name).toBe('users');
  });
});
