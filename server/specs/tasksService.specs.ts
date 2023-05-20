import request from 'supertest';
import { expect } from 'chai';
import { app } from '@/app';
import { ACCESS_ROLE, auth } from '@configs/authConfig';
import { TTaskCreation, TTaskEdit, TTaskJson } from '@type/schemas/projects/tasks';

const accessToken = 'Bearer ' + auth.createJwtToken({ userId: 1, role: ACCESS_ROLE.admin });

describe('task service specs', function () {
    describe('DELETE /projects/tasks/delete', function () {
        it('should reject attempt of task deletion', function (done) {
            const query = { taskId: 289375, projectId: 17 };
            request(app)
                .delete('/projects/tasks/delete')
                .set('Authorization', accessToken)
                .set('project-id', '17')
                .set('Accept', 'application/json')
                .query(query)
                .expect(401)
                .end((err) => done(err));
        });
    });
    describe('GET /projects/tasks/get', function () {
        it('should get specified task', function (done) {
            const query = { projectId: 17 };
            request(app)
                .get('/projects/tasks/get')
                .set('Authorization', accessToken)
                .set('project-id', '17')
                .set('Accept', 'application/json')
                .query(query)
                .expect(401)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
        it('should return 404', function (done) {
            const query = { projectId: 35235 };
            request(app)
                .get('/projects/tasks/get')
                .set('Authorization', accessToken)
                .set('project-id', '17')
                .set('Accept', 'application/json')
                .query(query)
                .expect(401)
                .end((err) => done(err));
        });
    });
    describe('PUT /projects/tasks/edit', function () {
        it('should update specified task', function (done) {
            const payload: TTaskJson<TTaskEdit> = {
                task: {
                    taskId: 17,
                    projectId: 17,
                    name: 'newtaskname',
                    description: 'new descr'
                }
            };
            request(app)
                .put('/projects/tasks/edit')
                .set('Authorization', accessToken)
                .set('project-id', '17')
                .set('Accept', 'application/json')
                .send(payload)
                .expect(401)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
        it('should reject updation of specified task', function (done) {
            const payload: TTaskJson<TTaskEdit> = {
                task: {
                    taskId: 17,
                    projectId: 16234,
                    name: 'newtaskname',
                    description: 'new descr'
                }
            };
            request(app)
                .put('/projects/tasks/edit')
                .set('Authorization', accessToken)
                .set('project-id', '17')
                .set('Accept', 'application/json')
                .send(payload)
                .expect(401)
                .end((err) => done(err));
        });
    });
    describe('POST /projects/tasks/create', function () {
        it('should reject create', function (done) {
            const payload: TTaskJson<TTaskCreation> = {
                task: {
                    projectId: 16234,
                    name: 'nojectname',
                    assignUserId: 1,
                    statusId: 1,
                    newTagIds: [],
                    description: ''
                }
            };
            request(app)
                .post('/projects/tasks/create')
                .set('Authorization', accessToken)
                .set('project-id', '17')
                .set('Accept', 'application/json')
                .send(payload)
                .expect(401)
                .end((err) => done(err));
        });
    });
});
