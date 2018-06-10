const commentTestId1 = '5b09afdd523e6e1957c83c74';

export default {
    superUser: {
        _id: '1b09b06b523e6e1957c83c6e',
        role: 1,
        mock: true
    },
    standardUser: {
        _id: '2b09b06b523e6e1957c83c6e',
        role: 0,
        mock: true
    },
    testAccessToken: Buffer.from('1b09b06b523e6e1957c83c6e.abc123abc123.test.test').toString('base64'),
    testToken (user) {
        return [{
            value: 'abc123abc123',
            user_id: '1b09b06b523e6e1957c83c6e',
            product_slug:'test',
            domain_slug: 'test',
            user: user,
            created: Date.now()
        }];
    },
    singleCommentTestId: commentTestId1,
    singleComment: {
        "_id": commentTestId1,
        "comment": "This is a comment",
        "domain": "test",
        "creator": "1b09b06b523e6e1957c83c6e",
        "modified_by": "1b09b06b523e6e1957c83c6e",
        "target_id": "5b09ac18e1e7441830460087",
        "overall_rating": 4,
        "__v": 0,
        "status": "published",
        "dimensions": [
            {
                "rating": 3,
                "name": "reliability"
            },
            {
                "rating": 4,
                "name": "fairness"
            },
            {
                "rating": 5,
                "name": "honesty"
            }
        ],
        "modified": "2018-05-26T19:03:00.000Z",
        "created": "2018-05-26T19:03:00.000Z"
    }
}