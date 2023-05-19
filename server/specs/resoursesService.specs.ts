import * as process from 'process';
import path from 'path';
import request from 'supertest';
import { app } from '@/app';
import { ACCESS_ROLE, auth } from '@configs/authConfig';

const accessToken = 'Bearer ' + auth.createJwtToken({ userId: 1, role: ACCESS_ROLE.admin });

describe('resource service specs', function () {
    describe('POST /resources/create', function () {
        it('should create new resource', function (done) {
            request(app)
                .post('/resources/create')
                .set('Authorization', accessToken)
                .field('event', 'file')
                .attach('file', path.join(process.cwd(), 'storage', 'OIP.jpg'))
                .expect(201)
                .end((err) => done(err));
        });
    });
});
