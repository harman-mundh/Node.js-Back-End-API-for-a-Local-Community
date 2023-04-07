const request = require('supertest')
const app = require('../app')

describe('Post new user', () => {
    it('should create a new user', async()=> {
        const res = await request(app.callback())
        .post('/api/v1/users')
        .send({
            username:'unique1234',  
            password: 'password',
            email: 'unique1234@email.com'
        })
        expect(res.statusCode).toEqual(201)
        expect(res.body).toHaveProperty('created', true)
    })
});

describe('name of the test', () => {
    it('what it should do', async () => {
        const res = await request(app.callback())
        .post('api/route')
        .send({
            // JSON data to be send with route
            username:'unique1234',  
            password: 'password',
            email: 'unique1234@email.com'
        })
        expect(res.statusCode).toEqual(500)
    })
});

desribe('name of the test', () => {
    it('what it should do', async () => {
        const res = await request(app.callback())
        .post('api/route')
        .auth('usename', 'password')
        .send({
            ID: 124,
            role: '',
            username: '',
            password: '',
            email: ''
        })
        expect(res.statusCode).toEqual(200)
    })
});