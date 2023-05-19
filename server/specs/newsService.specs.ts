import request from 'supertest';
import { expect } from 'chai';
import { app } from '@/app';
import { ACCESS_ROLE, auth } from '@configs/authConfig';
import { TNewsCreation, TNewsEdit, TNewsJson } from '@type/schemas/news';

const accessToken = 'Bearer ' + auth.createJwtToken({ userId: 1, role: ACCESS_ROLE.admin });

describe('news service specs', function () {
    describe('POST /news/create', function () {
        it('should reject attempt of news creation', function (done) {
            const payload: TNewsJson<TNewsCreation[]> = {
                news: [
                    {
                        text: 'asdasdas',
                        heading: 'asdasd',
                        authorId: 1
                    }
                ]
            };
            request(app)
                .post('/news/create')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .send(payload)
                .expect(400)
                .end((err) => done(err));
        });
    });
    describe('GET /news/get', function () {
        it('should get specified news', function (done) {
            const query = { 'newsIds[]': [4] };
            request(app)
                .get('/news/get')
                .set('Accept', 'application/json')
                .query(query)
                .expect(200)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
        it('should return 200', function (done) {
            const query = { 'newsIds[]': [352345] };
            request(app)
                .get('/news/get')
                .set('Accept', 'application/json')
                .query(query)
                .expect(200)
                .end((err) => done(err));
        });
    });
    describe('PUT /news/edit', function () {
        it('should update specified news', function (done) {
            const payload: TNewsJson<TNewsEdit> = {
                news: {
                    newsId: 4,
                    text: 'q34tq',
                    heading: 'q3t4t',
                    authorId: 2
                }
            };
            request(app)
                .put('/news/edit')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .send(payload)
                .expect(200)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
        it('should reject updation of specified news', function (done) {
            const payload: TNewsJson<TNewsEdit[]> = {
                news: [
                    {
                        newsId: 234564,
                        text: 'q34tq',
                        heading: 'q3t4t',
                        authorId: 2
                    }
                ]
            };
            request(app)
                .put('/news/edit')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .send(payload)
                .expect(400)
                .end((err) => done(err));
        });
    });
    describe('DELETE /news/delete', function () {
        it('should return 400', function (done) {
            const query = { 'newsIds[]': [289375] };
            request(app)
                .delete('/news/delete')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .query(query)
                .expect(400)
                .end((err) => done(err));
        });
    });
});
