import request from 'supertest';
import { expect } from 'chai';
import { app } from '@/app';
import { ACCESS_ROLE, auth } from '@configs/authConfig';

const accessToken = 'Bearer ' + auth.createJwtToken({ userId: 1, role: ACCESS_ROLE.admin });

describe('metric service specs', function () {
    describe('GET /metrics/get', function () {
        it('should get metrics', function (done) {
            const query = { isNeedDaily: true };
            request(app)
                .get('/metrics/get')
                .set('Authorization', accessToken)
                .set('Accept', 'application/json')
                .send(query)
                .expect(200)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
    });
    describe('PUT /metrics/edit', function () {
        it('should reject update of specified metric', function (done) {
            const query = { updateAction: 'METRICS_GUEST' };
            request(app)
                .put('/metrics/update')
                .set('Accept', 'application/json')
                .query(query)
                .expect(401)
                .end((err, res) => {
                    expect(res.body).to.be.an.instanceof(Object);
                    done(err);
                });
        });
        it('should reject updation of specified metric', function (done) {
            const query = { updateAction: 'METRICsdS_GUEST' };
            request(app)
                .put('/metrics/update')
                .set('Accept', 'application/json')
                .query(query)
                .expect(401)
                .end((err) => done(err));
        });
    });
});
