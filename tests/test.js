const request = require('supertest');
const app = require('../server/server');
jest.setTimeout(10000);

describe('Тестирование API системы опросов', () => {
    
    it('Должен создать нового пользователя', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                username: 'testuser_' + Date.now(),
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
    });

    it('Должен вернуть 400 при коротком пароле', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                username: 'bad',
                password: '1'
            });
        expect(res.statusCode).toEqual(400);
    });

    it('Должен возвращать список опросов', async () => {
        const res = await request(app).get('/api/polls');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
});
