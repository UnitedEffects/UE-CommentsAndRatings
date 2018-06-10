require('babel-core/register');
require('babel-polyfill');
require('sinon-mongoose');
import sinon from 'sinon';
import chai from 'chai';
import chaiHttp from 'chai-http';
import Token from '../services/auth/model';
import Comment from '../services/comrate/models/comment';
import Target from '../services/comrate/models/target';
import testMocks from './test_mocks';

const app = require('../app').default;
const Auth = require('../services/auth/auth').default;
const assert = chai.assert;
const tokenMock = sinon.mock(Token);
const authMock = sinon.mock(Auth);

chai.should();
chai.use(chaiHttp);

function to(promise, errorData = undefined) {
    return promise.then(data => [null, data])
        .catch(error => [error, errorData])
}

function authStub(user) {
    tokenMock.expects('find').returns(testMocks.testToken(user));
    authMock.expects('findToken').returns(testMocks.testToken(user)[0]);
}

/* API endpoint tests */
describe('app index route', () => {
    it('it should GET /', async () => {
        try {
            const res = await chai.request(app).get('/');
            res.should.have.status(200);
        } catch (error) {
            console.log(error);
            assert.fail("No error", error, "ERROR")
        }
    });

    it('it should handle 404 error', async () => {
        const [error, res] = await to(chai.request(app).get('/notExist'));
        error.response.should.have.status(404);
    });

    it('it should return 404 on get comment that does not exist', async () => {
        await authStub(testMocks.superUser);
        const commentMock = sinon.mock(Comment);
        commentMock.expects('findOne').returns(undefined);
        const [error, res] = await to(chai.request(app).get('/api/comment/test/5b09b06b523e6e1957c83c7c').set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        error.response.should.have.status(404);
        assert(error.response.body.code === 404, "Response body should return 404");
        assert(error.response.body.data._id === '5b09b06b523e6e1957c83c7c', "Response body should have the id requested");
        assert(error.response.body.data.domain === 'test', "Response body should have the domain requested");
        commentMock.restore();
    });

    it('it should return 200 and the comment on a valid query', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        commentMock.expects('findOne').withArgs({ _id: testMocks.singleCommentTestId, domain: 'test' }).returns(testMocks.singleComment);
        const [error, res] = await to(chai.request(app).get(`/api/comment/test/${testMocks.singleCommentTestId}`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENT");
        res.should.have.status(200);
        assert(res.body.type === 'Comment', "Response type should be Comment");
        assert(res.body.data._id === testMocks.singleCommentTestId, "Response body should have the id requested");
        assert(res.body.data.domain === 'test', "Response body should have the domain requested");
        assert(res.body.data.comment === 'This is a comment', "Should respond with the comment");
        assert(res.body.data.overall_rating === 4, "Should have an overall rating");
        assert(res.body.data.dimensions.length === 3, "Should have 3 dims");
        commentMock.restore();
    })
});