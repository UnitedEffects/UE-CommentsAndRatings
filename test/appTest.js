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
const config = require('../config');

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
    });

    it('it should return 204 from get all comments when the target does not exist', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').returns(undefined);
        commentMock.expects('find').withArgs({
            target_id: '5b09ac18e1e7441830460087',
            parent_id: undefined,
            domain: 'test' }
        ).chain('count').returns(4);
        commentMock.expects('aggregate').returns(testMocks.findAllComments_mixed);
        const [error, res] = await to(chai.request(app).get(`/api/comments/test?locator=https://testNotThere`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        res.should.have.status(204);
        commentMock.restore();
        targetMock.restore();
    });

    it('it should return all comments for a domain on query as a standard user with locator', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').withArgs({target_locator: 'https://test', domain: 'test'}).returns(testMocks.targetCreated);
        commentMock.expects('find').withArgs({
            target_id: '5b09ac18e1e7441830460087',
            domain: 'test' }
        ).chain('count').returns(4);
        commentMock.expects('aggregate').returns(testMocks.findAllComments_mixed);
        const [error, res] = await to(chai.request(app).get(`/api/comments/test?locator=https://test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comments', "Type is comment");
        assert(response.data.count === response.data.comments.length, "Count should be valid");
        res.should.have.status(200);
        commentMock.restore();
        targetMock.restore();
    });

    it('it should return 200 with empty comments when target exists but no comments', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').withArgs({target_locator: 'https://test', domain: 'test'}).returns(testMocks.targetCreated);
        commentMock.expects('find').withArgs({
            target_id: '5b09ac18e1e7441830460087',
            domain: 'test' }
        ).chain('count').returns(0);
        commentMock.expects('aggregate').returns([]);
        const [error, res] = await to(chai.request(app).get(`/api/comments/test?locator=https://test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comments', "Type is comment");
        assert(response.data.count === response.data.comments.length, "Count should be valid");
        res.should.have.status(200);
        commentMock.restore();
        targetMock.restore();
    });

    it('it should return all comments for a domain on query as a standard user with target id', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').withArgs({_id: '5b09ac18e1e7441830460087'}).returns(testMocks.targetCreated);
        commentMock.expects('find').withArgs({
            target_id: '5b09ac18e1e7441830460087',
            domain: 'test' }
        ).chain('count').returns(4);
        commentMock.expects('aggregate').returns(testMocks.findAllComments_mixed);
        const [error, res] = await to(chai.request(app).get(`/api/comments/test?targetId=5b09ac18e1e7441830460087`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comments', "Type is comment");
        assert(response.data.count === response.data.comments.length, "Count should be valid");
        res.should.have.status(200);
        commentMock.restore();
        targetMock.restore();
    });

    it('it should throw an error when targetId or locator are missing', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').withArgs({target_locator: 'https://test', domain: 'test'}).returns(testMocks.targetCreated);
        commentMock.expects('find').withArgs({
            domain: 'test' }
        ).chain('count').returns(4);
        commentMock.expects('aggregate').returns(testMocks.findAllComments_mixed);
        const [error, res] = await to(chai.request(app).get(`/api/comments/test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        const response = error.response.body;
        error.response.should.have.status(400);
        assert(response.code === 400, "Code included and is 400");
        assert(response.data === 'Unless you are an admin, either a locator or targetId is required. If both provided, ID is used.', "Error message returned");
        commentMock.restore();
        targetMock.restore();
    });

    it('it should return all comments across targets if you are and admin when targetId or locator are missing', async () => {
        await authStub(testMocks.superUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').withArgs({target_locator: 'https://test', domain: 'test'}).returns(testMocks.targetCreated);
        commentMock.expects('find').withArgs({
            domain: 'test2' }
        ).chain('count').returns(4);
        commentMock.expects('aggregate').returns(testMocks.findAllComments_mixed);
        const [error, res] = await to(chai.request(app).get(`/api/comments/test2`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comments', "Type is comment");
        res.should.have.status(200);
        commentMock.restore();
        targetMock.restore();
    });

    it('it should return published comments for a domain on query as a standard user with target id and status', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').withArgs({_id: '5b09ac18e1e7441830460087'}).returns(testMocks.targetCreated);
        commentMock.expects('find').withArgs({
            target_id: '5b09ac18e1e7441830460087',
            domain: 'test',
            status: 'published'}
        ).chain('count').returns(2);
        commentMock.expects('aggregate').returns(testMocks.findAllComments_published);
        const [error, res] = await to(chai.request(app).get(`/api/comments/test?targetId=5b09ac18e1e7441830460087&status=published`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comments', "Type is comment");
        assert(response.data.count === response.data.comments.length, "Count should be valid");
        res.should.have.status(200);
        commentMock.restore();
        targetMock.restore();
    });

    it('it should return pending comments for a domain on query as a standard user with target id and status', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').withArgs({_id: '5b09ac18e1e7441830460087'}).returns(testMocks.targetCreated);
        commentMock.expects('find').withArgs({
            target_id: '5b09ac18e1e7441830460087',
            domain: 'test',
            status: 'pending'}
        ).chain('count').returns(2);
        commentMock.expects('aggregate').returns(testMocks.findAllComments_pending);
        const [error, res] = await to(chai.request(app).get(`/api/comments/test?targetId=5b09ac18e1e7441830460087&status=pending`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comments', "Type is comment");
        assert(response.data.count === response.data.comments.length, "Count should be valid");
        res.should.have.status(200);
        commentMock.restore();
        targetMock.restore();
    });

    it('it should return child comments for a domain on query as a standard user with target id and parent id', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').withArgs({_id: '5b09ac18e1e7441830460087'}).returns(testMocks.targetCreated);
        commentMock.expects('find').withArgs({
            target_id: '5b09ac18e1e7441830460087',
            parent_id: '5b09afee523e6e1957c83c76',
            domain: 'test'}
        ).chain('count').returns(1);
        commentMock.expects('aggregate').returns(testMocks.findAllCommentsOfParent_1);
        const [error, res] = await to(chai.request(app).get(`/api/comments/test?targetId=5b09ac18e1e7441830460087&parentId=5b09afee523e6e1957c83c76`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comments', "Type is comment");
        assert(response.data.count === response.data.comments.length, "Count should be valid");
        res.should.have.status(200);
        commentMock.restore();
        targetMock.restore();
    });

    it('it should post a comment with standard user', async () => {
        await authStub(testMocks.standardUser);
        const commStub = sinon.stub(Comment.prototype, 'save');
        const targetMock = sinon.mock(Target);
        const commentPost = {
            "target_locator": "https://test",
            "type": "user",
            "comment": "This is a comment",
            "dimensions": [
                {
                    "rating": 5,
                    "name": "reliability"
                },
                {
                    "rating": 2,
                    "name": "fairness"
                },
                {
                    "rating": 5,
                    "name": "honesty"
                }
            ]
        };
        targetMock.expects('findOne').withArgs({target_locator: 'https://test', domain: 'test', type: 'user'}).returns(testMocks.targetCreated);
        commStub.returns(testMocks.commentCreated);
        const [error, res] = await to(chai.request(app).post(`/api/comment/test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(commentPost));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comment', "Type is comment");
        res.should.have.status(200);
        assert(response.data.target_id === '5b09ac18e1e7441830460087', "target id");
        assert(response.data.creator === '58fc2095b33ef700014359af', "standard user id");
        assert(response.data.comment === commentPost.comment, "comment is the same");
        assert(response.data.dimensions.length === commentPost.dimensions.length, "dimensions the same");
        assert(response.data.overall_rating === 4, "overall rating calculated");
        assert(response.data.status === "pending", "should be pending state");
        assert(response.data.parent_id === null, "should not have a parent");
        commStub.restore();
        targetMock.restore();
    });

    it('it should post a comment with standard user when no target exists yet', async () => {
        await authStub(testMocks.standardUser);
        const commStub = sinon.stub(Comment.prototype, 'save');
        const targStub = sinon.stub(Target.prototype, 'save');
        const targetMock = sinon.mock(Target);
        const commentPost = {
            "target_locator": "https://test2",
            "type": "user",
            "comment": "This is a comment",
            "dimensions": [
                {
                    "rating": 5,
                    "name": "reliability"
                },
                {
                    "rating": 2,
                    "name": "fairness"
                },
                {
                    "rating": 5,
                    "name": "honesty"
                }
            ]
        };
        targetMock.expects('findOne').withArgs({target_locator: 'https://test2', domain: 'test', type: 'user'}).returns(undefined);
        commStub.returns(testMocks.commentCreated);
        const newTargetCreated = JSON.parse(JSON.stringify(testMocks.targetCreated));
        newTargetCreated.target_locator = 'https://test2';
        newTargetCreated._id = '5b09ac18e1e7441830460088';
        targStub.returns(newTargetCreated);
        const [error, res] = await to(chai.request(app).post(`/api/comment/test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(commentPost));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comment', "Type is comment");
        res.should.have.status(200);
        assert(response.data.target_id === '5b09ac18e1e7441830460087', "target id");
        assert(response.data.creator === '58fc2095b33ef700014359af', "standard user id");
        assert(response.data.comment === commentPost.comment, "comment is the same");
        assert(response.data.dimensions.length === commentPost.dimensions.length, "dimensions the same");
        assert(response.data.overall_rating === 4, "overall rating calculated");
        assert(response.data.status === "pending", "should be pending state");
        assert(response.data.parent_id === null, "should not have a parent");
        commStub.restore();
        targetMock.restore();
        targStub.restore();
    });

    it('it should error on posting a comment with standard user who forgets target locator', async () => {
        await authStub(testMocks.standardUser);
        const commStub = sinon.stub(Comment.prototype, 'save');
        const targetMock = sinon.mock(Target);
        const commentPost = {
            "type": "user",
            "comment": "This is a comment",
            "dimensions": [
                {
                    "rating": 5,
                    "name": "reliability"
                },
                {
                    "rating": 2,
                    "name": "fairness"
                },
                {
                    "rating": 5,
                    "name": "honesty"
                }
            ]
        };
        targetMock.expects('findOne').withArgs({target_locator: 'https://test', domain: 'test', type: 'user'}).returns(testMocks.targetCreated);
        commStub.returns(testMocks.commentCreated);
        const [error, res] = await to(chai.request(app).post(`/api/comment/test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(commentPost));
        const response = error.response.body;
        error.response.should.have.status(400);
        assert(response.code === 400, "should have code");
        assert(response.data.isJoi === true, "this should fail matching schema");
        assert(response.data.name === 'ValidationError', "this is a validation error");
        commStub.restore();
        targetMock.restore();
    });

    it('it should error on posting a comment with standard user who forgets type', async () => {
        await authStub(testMocks.standardUser);
        const commStub = sinon.stub(Comment.prototype, 'save');
        const targetMock = sinon.mock(Target);
        const commentPost = {
            "target_locator": "https://test",
            "comment": "This is a comment",
            "dimensions": [
                {
                    "rating": 5,
                    "name": "reliability"
                },
                {
                    "rating": 2,
                    "name": "fairness"
                },
                {
                    "rating": 5,
                    "name": "honesty"
                }
            ]
        };
        targetMock.expects('findOne').withArgs({target_locator: 'https://test', domain: 'test', type: 'user'}).returns(testMocks.targetCreated);
        commStub.returns(testMocks.commentCreated);
        const [error, res] = await to(chai.request(app).post(`/api/comment/test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(commentPost));
        const response = error.response.body;
        error.response.should.have.status(400);
        assert(response.code === 400, "should have code");
        assert(response.data.isJoi === true, "this should fail matching schema");
        assert(response.data.name === 'ValidationError', "this is a validation error");
        commStub.restore();
        targetMock.restore();
    });

    it('it should error on posting a comment with standard user who forgets comment', async () => {
        await authStub(testMocks.standardUser);
        const commStub = sinon.stub(Comment.prototype, 'save');
        const targetMock = sinon.mock(Target);
        const commentPost = {
            "target_locator": "https://test",
            "type": "user",
            "dimensions": [
                {
                    "rating": 5,
                    "name": "reliability"
                },
                {
                    "rating": 2,
                    "name": "fairness"
                },
                {
                    "rating": 5,
                    "name": "honesty"
                }
            ]
        };
        targetMock.expects('findOne').withArgs({target_locator: 'https://test', domain: 'test', type: 'user'}).returns(testMocks.targetCreated);
        commStub.returns(testMocks.commentCreated);
        const [error, res] = await to(chai.request(app).post(`/api/comment/test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(commentPost));
        const response = error.response.body;
        error.response.should.have.status(400);
        assert(response.code === 400, "should have code");
        assert(response.data.isJoi === true, "this should fail matching schema");
        assert(response.data.name === 'ValidationError', "this is a validation error");
        commStub.restore();
        targetMock.restore();
    });

    it('it should update a comment with PUT using a super user', async () => {
        await authStub(testMocks.superUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        const commentPut = {
            "_id": "1b09ac18e1e7441830460000",
            "target_id": "5b09ac18e1e7441830460087",
            "comment": "This is a comment",
            "domain": "test",
            "status": "published",
            "dimensions": [
                {
                    "rating": 5,
                    "name": "reliability"
                },
                {
                    "rating": 2,
                    "name": "fairness"
                },
                {
                    "rating": 5,
                    "name": "honesty"
                }
            ]
        };
        targetMock.expects('findOne').returns(testMocks.targetCreated);
        commentMock.expects('findOne').returns(testMocks.commentCreated);
        commentMock.expects('findOneAndUpdate').returns(testMocks.commentUpdated);
        const [error, res] = await to(chai.request(app).put(`/api/comment/test/1b09ac18e1e7441830460000`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(commentPut));
        if(error) return assert.fail("No error", error, "ERROR ON PUT COMMENT");
        const response = res.body;
        assert(response.type === 'Comment', "Type is comment");
        res.should.have.status(200);
        assert(response.data.target_id === '5b09ac18e1e7441830460087', "target id");
        assert(response.data.creator === '58fc2095b33ef700014359af', "standard user id");
        assert(response.data.comment === commentPut.comment, "comment is the same");
        assert(response.data.dimensions.length === commentPut.dimensions.length, "dimensions the same");
        assert(response.data.overall_rating === 4, "overall rating calculated");
        assert(response.data.status === "published", "should be pending state");
        assert(response.data.parent_id === null, "should not have a parent");
        assert(response.data.__v === 1, "version");
        commentMock.restore();
        targetMock.restore();
    });

    it('it should NOT update a comment with PUT using a standard user', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        const commentPut = {
            "_id": "1b09ac18e1e7441830460000",
            "target_id": "5b09ac18e1e7441830460087",
            "type": "user",
            "comment": "This is a comment",
            "dimensions": [
                {
                    "rating": 5,
                    "name": "reliability"
                },
                {
                    "rating": 2,
                    "name": "fairness"
                },
                {
                    "rating": 5,
                    "name": "honesty"
                }
            ]
        };
        targetMock.expects('findOne').returns(testMocks.targetCreated);
        commentMock.expects('findOne').returns(testMocks.commentCreated);
        commentMock.expects('findOneAndUpdate').returns(testMocks.targetCreated);
        const [error, res] = await to(chai.request(app).put(`/api/comment/test/1b09ac18e1e7441830460000`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(commentPut));
        const response = error.response.body;
        error.response.should.have.status(401);
        assert(response.code === 401, "401 forbidden");
        assert(response.data === 'Must be commenter or admin to change this.', "401 message");
        commentMock.restore();
        targetMock.restore();
    });

    it('it should update a comment with PUT using a standard user who created the comment', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        const commentPut = {
            "_id": "1b09ac18e1e7441830460000",
            "target_id": "5b09ac18e1e7441830460087",
            "comment": "This is a comment",
            "domain": "test",
            "status": "published",
            "dimensions": [
                {
                    "rating": 5,
                    "name": "reliability"
                },
                {
                    "rating": 2,
                    "name": "fairness"
                },
                {
                    "rating": 5,
                    "name": "honesty"
                }
            ]
        };
        const newCommentCreated = JSON.parse(JSON.stringify(testMocks.commentCreated));
        const newCommentUpdated = JSON.parse(JSON.stringify(testMocks.commentUpdated));
        newCommentCreated.creator = '2b09b06b523e6e1957c83c6e';
        newCommentUpdated.creator = '2b09b06b523e6e1957c83c6e';
        targetMock.expects('findOne').returns(testMocks.targetCreated);
        commentMock.expects('findOne').returns(newCommentCreated);
        commentMock.expects('findOneAndUpdate').returns(newCommentUpdated);
        const [error, res] = await to(chai.request(app).put(`/api/comment/test/1b09ac18e1e7441830460000`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(commentPut));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comment', "Type is comment");
        res.should.have.status(200);
        assert(response.data.target_id === '5b09ac18e1e7441830460087', "target id");
        assert(response.data.creator === '2b09b06b523e6e1957c83c6e', "standard user id");
        assert(response.data.comment === commentPut.comment, "comment is the same");
        assert(response.data.dimensions.length === commentPut.dimensions.length, "dimensions the same");
        assert(response.data.overall_rating === 4, "overall rating calculated");
        assert(response.data.status === "published", "should be pending state");
        assert(response.data.parent_id === null, "should not have a parent");
        assert(response.data.__v === 1, "version");
        commentMock.restore();
        targetMock.restore();
    });

    it('it should delete a comment using a super user', async () => {
        await authStub(testMocks.superUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').returns(testMocks.targetCreated);
        commentMock.expects('findOne').returns(testMocks.commentCreated);
        commentMock.expects('findOneAndRemove').returns(testMocks.commentUpdated);
        const [error, res] = await to(chai.request(app).delete(`/api/comment/test/1b09ac18e1e7441830460000`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comment', "Type is comment");
        res.should.have.status(200);
        assert(response.data.target_id === '5b09ac18e1e7441830460087', "target id");
        assert(response.data.creator === '58fc2095b33ef700014359af', "standard user id");
        assert(response.data.overall_rating === 4, "overall rating calculated");
        assert(response.data.status === "published", "should be pending state");
        assert(response.data.parent_id === null, "should not have a parent");
        commentMock.restore();
        targetMock.restore();
    });

    it('it should delete a comment using a standard user who created the comment', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        const newCommentCreated = JSON.parse(JSON.stringify(testMocks.commentCreated));
        const newCommentUpdated = JSON.parse(JSON.stringify(testMocks.commentUpdated));
        newCommentCreated.creator = '2b09b06b523e6e1957c83c6e';
        newCommentUpdated.creator = '2b09b06b523e6e1957c83c6e';
        targetMock.expects('findOne').returns(testMocks.targetCreated);
        commentMock.expects('findOne').returns(newCommentCreated);
        commentMock.expects('findOneAndRemove').returns(newCommentUpdated);
        const [error, res] = await to(chai.request(app).delete(`/api/comment/test/1b09ac18e1e7441830460000`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Comment', "Type is comment");
        res.should.have.status(200);
        assert(response.data.target_id === '5b09ac18e1e7441830460087', "target id");
        assert(response.data.creator === '2b09b06b523e6e1957c83c6e', "standard user id");
        assert(response.data.overall_rating === 4, "overall rating calculated");
        assert(response.data.status === "published", "should be pending state");
        assert(response.data.parent_id === null, "should not have a parent");
        assert(response.data.__v === 1, "version");
        commentMock.restore();
        targetMock.restore();
    });

    it('it should NOT delete a comment using a standard user', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').returns(testMocks.targetCreated);
        commentMock.expects('findOne').returns(testMocks.commentCreated);
        commentMock.expects('findOneAndRemove').returns(testMocks.targetCreated);
        const [error, res] = await to(chai.request(app).delete(`/api/comment/test/1b09ac18e1e7441830460000`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        const response = error.response.body;
        error.response.should.have.status(401);
        assert(response.code === 401, "401 forbidden");
        assert(response.data === 'Must be commenter or admin to delete this.', "401 message");
        commentMock.restore();
        targetMock.restore();
    });

    it('it should return 204 on aggregate call when target does not exist', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').returns(undefined);
        commentMock.expects('aggregate').withArgs([
            {   "$match": { "target_id": '5b09ac18e1e7441830460087', parent_id: undefined, status: "published" } },
            {   "$limit": 1000 },
            {   "$unwind": "$dimensions" },
            {   "$group": {
                _id: '$dimensions.name',
                overall_rating: {$avg: "$dimensions.rating"}
            }
            }
        ]).returns(testMocks.targetAggregateComments);
        commentMock.expects('aggregate').withArgs([
            {   "$match": { "target_id": '5b09ac18e1e7441830460087', parent_id: undefined, status: "published" } },
            {   "$limit": 1000 },
            {   "$group": {
                _id: '5b09ac18e1e7441830460087',
                average_rating: {$avg: "$overall_rating"}
            }
            }
        ]).returns([{average_rating: 3.5}]);
        const [error, res] = await to(chai.request(app).get(`/api/target/test?locator=https://testNotThere`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        res.should.have.status(204);
        commentMock.restore();
        targetMock.restore();
    });

    it('it should return 200 on aggregate target even when there are no comments', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').withArgs({target_locator: 'https://testFake', domain: 'test'}).returns(testMocks.targetCreated);
        commentMock.expects('aggregate').returns([]);
        commentMock.expects('aggregate').returns([]);
        const [error, res] = await to(chai.request(app).get(`/api/target/test?locator=https://testFake`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Target', "Type is Target");
        res.should.have.status(200);
        assert(response.data._id === '5b09ac18e1e7441830460087', "ID should be the same");
        assert(response.data.target_locator === 'https://test', "Target locator");
        assert(response.data.dimensions.length === 0, "dims are 3 long");
        commentMock.restore();
        targetMock.restore();
    });

    it('it should get aggregate comments and target using a standard user and locator', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').returns(testMocks.targetCreated);
        commentMock.expects('aggregate').withArgs([
            {   "$match": { "target_id": '5b09ac18e1e7441830460087', parent_id: undefined, status: config.APPROVAL_STATUS_WORD } },
            {   "$limit": 1000 },
            {   "$unwind": "$dimensions" },
            {   "$group": {
                _id: '$dimensions.name',
                overall_rating: {$avg: "$dimensions.rating"}
            }
            }
        ]).returns(testMocks.targetAggregateComments);
        commentMock.expects('aggregate').withArgs([
            {   "$match": { "target_id": '5b09ac18e1e7441830460087', parent_id: undefined, status: config.APPROVAL_STATUS_WORD } },
            {   "$limit": 1000 },
            {   "$group": {
                _id: '5b09ac18e1e7441830460087',
                average_rating: {$avg: "$overall_rating"}
            }
            }
        ]).returns([{average_rating: 3.5}]);
        const [error, res] = await to(chai.request(app).get(`/api/target/test?locator=https://test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Target', "Type is Target");
        res.should.have.status(200);
        assert(response.data._id === '5b09ac18e1e7441830460087', "ID should be the same");
        assert(response.data.target_locator === 'https://test', "Target locator");
        assert(response.data.average_rating === 3.5, "average rating");
        assert(response.data.dimensions.length === 3, "dims are 3 long");
        assert(response.data.dimensions[0].name === 'honest' || 'fairness' || 'reliability', "make sure we have the model as name and not _id on dims");
        commentMock.restore();
        targetMock.restore();
    });

    it('it should get aggregate comments and target using a standard user and targetId', async () => {
        await authStub(testMocks.standardUser);
        const commentMock = sinon.mock(Comment);
        const targetMock = sinon.mock(Target);
        targetMock.expects('findOne').returns(testMocks.targetCreated);
        commentMock.expects('aggregate').withArgs([
            {   "$match": { "target_id": '5b09ac18e1e7441830460087', parent_id: undefined, status: config.APPROVAL_STATUS_WORD } },
            {   "$limit": 1000 },
            {   "$unwind": "$dimensions" },
            {   "$group": {
                _id: '$dimensions.name',
                overall_rating: {$avg: "$dimensions.rating"}
            }
            }
        ]).returns(testMocks.targetAggregateComments);
        commentMock.expects('aggregate').withArgs([
            {   "$match": { "target_id": '5b09ac18e1e7441830460087', parent_id: undefined, status: config.APPROVAL_STATUS_WORD } },
            {   "$limit": 1000 },
            {   "$group": {
                _id: '5b09ac18e1e7441830460087',
                average_rating: {$avg: "$overall_rating"}
            }
            }
        ]).returns([{average_rating: 3.5}]);
        const [error, res] = await to(chai.request(app).get(`/api/target/test?targetId=5b09ac18e1e7441830460087`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Target', "Type is Target");
        res.should.have.status(200);
        assert(response.data._id === '5b09ac18e1e7441830460087', "ID should be the same");
        assert(response.data.target_locator === 'https://test', "Target locator");
        assert(response.data.average_rating === 3.5, "average rating");
        assert(response.data.dimensions.length === 3, "dims are 3 long");
        assert(response.data.dimensions[0].name === 'honesty' || 'fairness' || 'reliability', "make sure we have the model as name and not _id on dims");
        commentMock.restore();
        targetMock.restore();
    });

    it('it should update a target with patch using a super user', async () => {
        await authStub(testMocks.superUser);
        const targetMock = sinon.mock(Target);
        const targetUpdate = {
            type: 'property'
        };
        targetMock.expects('findOneAndUpdate').withArgs({_id: '5b09ac18e1e7441830460087', domain: 'test'}, {type: 'property'}, {new: true, runValidators: true}).returns(testMocks.targetUpdated);
        const [error, res] = await to(chai.request(app).patch(`/api/target/test/5b09ac18e1e7441830460087`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(targetUpdate));
        if(error) return assert.fail("No error", error, "ERROR ON PATCH COMMENTS");
        const response = res.body;
        assert(response.type === 'Target', "Type is Target");
        res.should.have.status(200);
        assert(response.data.type === 'property', "type changed");
        assert(response.data._id === '5b09ac18e1e7441830460087', "id the same");
        targetMock.restore();
    });

    it('it should NOT update a target with patch using a standard user', async () => {
        await authStub(testMocks.standardUser);
        const targetMock = sinon.mock(Target);
        const targetUpdate = {
            type: 'property'
        };
        targetMock.expects('findOneAndUpdate').withArgs({_id: '5b09ac18e1e7441830460087', domain: 'test'}, {type: 'property'}, {new: true, runValidators: true}).returns(testMocks.targetUpdated);
        const [error, res] = await to(chai.request(app).patch(`/api/target/test/5b09ac18e1e7441830460087`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(targetUpdate));
        error.response.should.have.status(401);
        targetMock.restore();
    });

    it('it should delete a target using a super user', async () => {
        await authStub(testMocks.superUser);
        const targetMock = sinon.mock(Target);
        const commentMock = sinon.mock(Comment);
        commentMock.expects('deleteMany').returns(true);
        targetMock.expects('findOneAndRemove').withArgs({_id: '5b09ac18e1e7441830460087', domain: 'test'}).returns(testMocks.targetCreated);
        const [error, res] = await to(chai.request(app).delete(`/api/target/test/5b09ac18e1e7441830460087`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Target', "Type is Target");
        res.should.have.status(200);
        assert(response.data.type === 'user', "type changed");
        assert(response.data.domain === 'test', "domain");
        assert(response.data._id === '5b09ac18e1e7441830460087', "id the same");
        targetMock.restore();
        commentMock.restore();
    });

    it('it should NOT delete a target using a standard user', async () => {
        await authStub(testMocks.standardUser);
        const targetMock = sinon.mock(Target);
        const commentMock = sinon.mock(Comment);
        commentMock.expects('deleteMany').returns(true);
        targetMock.expects('findOneAndRemove').withArgs({_id: '5b09ac18e1e7441830460087', domain: 'test'}).returns(testMocks.targetUpdated);
        const [error, res] = await to(chai.request(app).delete(`/api/target/test/5b09ac18e1e7441830460087`).set('Authorization', `Bearer ${testMocks.testAccessToken}`));
        error.response.should.have.status(401);
        targetMock.restore();
        commentMock.restore();
    });

    it('it should post a target with super user', async () => {
        await authStub(testMocks.superUser);
        const targetStub = sinon.stub(Target.prototype, 'save');
        const targetPost = {
            "target_locator": "https://test",
            "type": "user"
        };
        targetStub.returns(testMocks.targetCreated);
        const [error, res] = await to(chai.request(app).post(`/api/target/test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(targetPost));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Target', "Type is Target");
        res.should.have.status(200);
        assert(response.data._id, "there should be a generated id");
        assert(response.data.type === 'user', "type is user");
        assert(response.data.domain === 'test', "test domain");
        assert(response.data.active === true, "its active");
        targetStub.restore();
    });

    it('it should post a target with standard user', async () => {
        await authStub(testMocks.standardUser);
        const targetStub = sinon.stub(Target.prototype, 'save');
        const targetPost = {
            "target_locator": "https://test",
            "type": "user"
        };
        targetStub.returns(testMocks.targetCreated);
        const [error, res] = await to(chai.request(app).post(`/api/target/test`).set('Authorization', `Bearer ${testMocks.testAccessToken}`).send(targetPost));
        if(error) return assert.fail("No error", error, "ERROR ON GET COMMENTS");
        const response = res.body;
        assert(response.type === 'Target', "Type is Target");
        res.should.have.status(200);
        assert(response.data._id, "there should be a generated id");
        assert(response.data.type === 'user', "type is user");
        assert(response.data.domain === 'test', "test domain");
        assert(response.data.active === true, "its active");
        targetStub.restore();
    });
});
