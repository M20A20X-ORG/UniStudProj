import request from 'supertest';
import { expect } from 'chai';
import { app } from '@/app';
import { ACCESS_ROLE, auth } from '@configs/authConfig';
import { TUserEdit, TUserJson, TUserRegistration } from '@type/schemas/user';

const accessToken = 'Bearer ' + auth.createJwtToken({ userId: 1, role: ACCESS_ROLE.admin });

describe('User service specs', function () {
    describe('DELETE /user/delete', function () {
        it('should reject attempt of user deletion', function (done) {
            const query = { userId: 289375 };
            request(app)
                .delete('/users/delete')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .query(query)
                .expect(409)
                .end((err) => done(err));
        });
    });
    describe('GET /user/get', function () {
        it('should get specified user', function (done) {
            const query = { 'userIdentifiers[]': [2] };
            request(app)
                .get('/users/get')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .query(query)
                .expect(200)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
        it('should return 404', function (done) {
            const query = { 'userIdentifiers[]': [12312] };
            request(app)
                .get('/users/get')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .query(query)
                .expect(404)
                .end((err) => done(err));
        });
    });
    describe('PUT /user/edit', function () {
        it('should update specified user', function (done) {
            const payload: TUserJson<TUserEdit> = {
                user: {
                    userId: 2,
                    username: 'newusername',
                    password: 'newpassword',
                    passwordConfirm: 'newpassword'
                }
            };
            request(app)
                .put('/users/edit')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .send(payload)
                .expect(201)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
        it('should reject updation of specified user', function (done) {
            const payload: TUserJson<TUserEdit> = {
                user: {
                    userId: 2,
                    username: 'newusername',
                    password: 'newpassword',
                    passwordConfirm: 'newpasswodrd'
                }
            };
            request(app)
                .put('/users/edit')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .send(payload)
                .expect(409)
                .end((err) => done(err));
        });
    });
    describe('POST /user/register', function () {
        it('should reject registration', function (done) {
            const payload: TUserJson<TUserRegistration> = {
                user: {
                    username: 'newusername',
                    password: 'newpassword',
                    passwordConfirm: 'notnewpass',
                    name: 'Shapovalov Maksym Romanovich',
                    group: 'group',
                    email: 'maks0681912507@sgmail.com',
                    imgUrl: '',
                    about: ''
                }
            };
            request(app)
                .post('/users/register')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .send(payload)
                .expect(409)
                .end((err) => done(err));
        });
    });
});
