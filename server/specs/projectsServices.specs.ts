import request from 'supertest';
import { expect } from 'chai';
import { app } from '@/app';
import { ACCESS_ROLE, auth } from '@configs/authConfig';
import { TProjectCreation, TProjectEdit, TProjectJson } from '@type/schemas/projects/project';

const accessToken = 'Bearer ' + auth.createJwtToken({ userId: 1, role: ACCESS_ROLE.admin });

describe('project service specs', function () {
    describe('DELETE /project/delete', function () {
        it('should reject attempt of project deletion', function (done) {
            const query = { projectId: 289375 };
            request(app)
                .delete('/projects/delete')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .query(query)
                .expect(409)
                .end((err) => done(err));
        });
    });
    describe('GET /project/get', function () {
        it('should return 400', function (done) {
            const query = { 'projectIds[]': [7, 12] };
            request(app)
                .get('/projects/get')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .query(query)
                .expect(400)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
        it('should return 404', function (done) {
            const query = { 'projectIds[]': [326564] };
            request(app)
                .get('/projects/get')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .query(query)
                .expect(404)
                .end((err) => done(err));
        });
    });
    describe('PUT /project/edit', function () {
        it('should update specified project', function (done) {
            const payload: TProjectJson<TProjectEdit> = {
                project: {
                    projectId: 7,
                    name: 'newprojectname',
                    description: 'new descr'
                }
            };
            request(app)
                .put('/projects/edit')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .send(payload)
                .expect(200)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
        it('should update specified project', function (done) {
            const payload: TProjectJson<TProjectEdit> = {
                project: {
                    projectId: 2,
                    name: 'newprojectname',
                    description: 'new descr'
                }
            };
            request(app)
                .put('/projects/edit')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .send(payload)
                .expect(200)
                .end((err) => done(err));
        });
    });
    describe('POST /project/create', function () {
        it('should reject create', function (done) {
            const payload: TProjectJson<TProjectCreation> = {
                project: {
                    name: 'nojectname',
                    dateStart: '2023-12-12',
                    dateEnd: '2023-12-12',
                    newParticipantIds: [],
                    newTagIds: [],
                    description: ''
                }
            };
            request(app)
                .post('/projects/create')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .send(payload)
                .expect(409)
                .end((err) => done(err));
        });
    });
});
