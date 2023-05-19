import request from 'supertest';
import { expect } from 'chai';
import { app } from '@/app';
import { TUserJson } from "@type/schemas/user";
import { TAuthPayload, TUserLogin } from "@type/schemas/auth";

describe('Auth service specs', function () {
    describe('GET /auth/login', function () {
        it('should log in user only first time', function (done) {
            const payload: TUserJson<TUserLogin> = {
                user: {
                    username: 'username',
                    password: 'password'
                }
            };
            request(app)
                .post('/auth/login')
                .set('Content-type', 'application/json')
                .set('Accept', 'application/json')
                .send(payload)
                .expect(200)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
        it('should decline log in attempt', function (done) {
            const payload:TUserJson<TUserLogin> = {
                user: {
                    username: 'incorrectusernamse',
                    password: 'password'
                }
            };
            request(app)
                .post('/auth/login')
                .set('Content-type', 'application/json')
                .set('Accept', 'application/json')
                .expect(404)
                .send(payload)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
    });
});
