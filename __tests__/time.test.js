const request = require('supertest');
const app = require('../src/server');

// Helper to validate ISO string
function isISODateString(str) {
  // Basic check using Date parsing
  const d = new Date(str);
  return !isNaN(d.getTime()) && /\d{4}-\d{2}-\d{2}T/.test(str);
}

// Helper to validate "+HH:MM" or "-HH:MM"
function isUtcOffset(str) {
  return /^[+-]\d{2}:\d{2}$/.test(str);
}

describe('GET /api/v1/time', () => {
  it('returns current server time payload', async () => {
    const res = await request(app).get('/api/v1/time');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);

    const body = res.body;
    expect(body).toBeDefined();

    // shape
    expect(body).toHaveProperty('iso');
    expect(body).toHaveProperty('epochMillis');
    expect(body).toHaveProperty('timezone');
    expect(body).toHaveProperty('utcOffset');

    // types and basic validation
    expect(typeof body.iso).toBe('string');
    expect(isISODateString(body.iso)).toBe(true);

    expect(typeof body.epochMillis).toBe('number');
    // sanity: epochMillis close to now (within 10 seconds)
    const now = Date.now();
    expect(Math.abs(now - body.epochMillis)).toBeLessThan(10_000);

    expect(typeof body.timezone).toBe('string');
    expect(body.timezone.length).toBeGreaterThan(0);

    expect(typeof body.utcOffset).toBe('string');
    expect(isUtcOffset(body.utcOffset)).toBe(true);
  });
});
