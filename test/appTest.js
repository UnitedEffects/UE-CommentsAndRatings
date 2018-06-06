//todo - need to figure out how to mock/stub auth during testing

require('babel-core/register');
require('babel-polyfill');
const app = require('../app').default;
import sinon from 'sinon';
import chai from 'chai';
import chaiHttp from 'chai-http';
require('sinon-mongoose');
import Comment from '../services/comrate/models/comment';
import Target from '../services/comrate/models/target';

chai.should();
const assert = chai.assert;
chai.use(chaiHttp);

/* Test the /GET route */
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
        try {
            const res = await chai.request(app).get('/notExist');
            assert.fail("Expecting 404 Error", res.status, "NEGATIVE TEST")
        } catch (error) {
            error.response.should.have.status(404);
        }
    });

    it('it should return 404 on get comment that does not exist', async () => {
        try {
            const commentMock = sinon.mock(Comment);
            const exRes = undefined;
            commentMock.expects('findOne').returns(exRes);
            const res = await chai.request(app).get('/api/comment/test/5b09b06b523e6e1957c83c7c');
            assert.fail("Expecting 404 Error", res.status, "NEGATIVE TEST")
        }
        catch(error){
            error.response.should.have.status(404);
            assert(error.response.body.code === 404, "Response body should return 404");
            assert(error.response.body.data._id === '5b09b06b523e6e1957c83c7c', "Response body should have the id requested");
            assert(error.response.body.data.domain === 'test', "Response body should have the domain requested")
        }
    })
});
