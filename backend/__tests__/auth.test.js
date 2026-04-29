const request = require('supertest');
const { app, startServer, stopServer } = require('../src/server');
const { initDb, closeDb } = require('../src/db');

describe('Auth API', () => {
  beforeAll((done) => {
    // Use in-memory SQLite for tests
    initDb(':memory:', () => {
      startServer(0, done); // Port 0 lets OS assign random free port
    });
  });

  afterAll((done) => {
    stopServer(() => {
      closeDb(done);
    });
  });

  test('POST /api/register creates user with 6-digit ID', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'testuser', password: 'password123' });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('testuser');
    // Ensure unique_id is exactly 6 digits
    expect(res.body.user.unique_id).toMatch(/^[0-9]{6}$/);
  });
});
