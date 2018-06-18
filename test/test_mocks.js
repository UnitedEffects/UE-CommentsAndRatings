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
    },
    findAllComments_mixed: [
        {
            "_id": "5b09af5c6cd9dd193a6305cf",
            "comment": "This is comment 1",
            "domain": "test",
            "creator": "58fc2095b33ef700014359af",
            "modified_by": "58fc2095b33ef700014359af",
            "target_id": "5b09ac18e1e7441830460087",
            "__v": 0,
            "status": "pending",
            "dimensions": [],
            "modified": "2018-05-26T19:01:00.000Z",
            "created": "2018-05-26T19:01:00.000Z"
        },
        {
            "_id": "5b09afb6523e6e1957c83c70",
            "comment": "This is comment 2",
            "target_id": "5b09ac18e1e7441830460087",
            "creator": "58fc2095b33ef700014359af",
            "domain": "test",
            "modified_by": "58fc2095b33ef700014359af",
            "overall_rating": 2.5,
            "status": "published",
            "dimensions": [
                {
                    "name": "reliability",
                    "rating": 1
                },
                {
                    "name": "fairness",
                    "rating": 4
                }
            ],
            "modified": "2018-06-11T22:06:00.000Z",
            "created": "2018-05-26T19:03:00.000Z"
        },
        {
            "_id": "5b09afdd523e6e1957c83c74",
            "comment": "This is comment 4",
            "domain": "test",
            "creator": "58fc2095b33ef700014359af",
            "modified_by": "58fc2095b33ef700014359af",
            "target_id": "5b09ac18e1e7441830460087",
            "overall_rating": 4,
            "__v": 0,
            "status": "pending",
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
        },
        {
            "_id": "5b09afee523e6e1957c83c76",
            "comment": "This is comment 5",
            "domain": "test",
            "creator": "58fc2095b33ef700014359af",
            "modified_by": "58fc2095b33ef700014359af",
            "target_id": "5b09ac18e1e7441830460087",
            "overall_rating": 4,
            "__v": 0,
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
            ],
            "modified": "2018-05-26T19:03:00.000Z",
            "created": "2018-05-26T19:03:00.000Z"
        }
    ],
    findAllComments_published: [
        {
            "_id": "5b09afb6523e6e1957c83c70",
            "comment": "This is comment 2",
            "target_id": "5b09ac18e1e7441830460087",
            "creator": "58fc2095b33ef700014359af",
            "domain": "test",
            "modified_by": "58fc2095b33ef700014359af",
            "overall_rating": 2.5,
            "status": "published",
            "dimensions": [
                {
                    "name": "reliability",
                    "rating": 1
                },
                {
                    "name": "fairness",
                    "rating": 4
                }
            ],
            "modified": "2018-06-11T22:06:00.000Z",
            "created": "2018-05-26T19:03:00.000Z"
        },
        {
            "_id": "5b09afee523e6e1957c83c76",
            "comment": "This is comment 5",
            "domain": "test",
            "creator": "58fc2095b33ef700014359af",
            "modified_by": "58fc2095b33ef700014359af",
            "target_id": "5b09ac18e1e7441830460087",
            "overall_rating": 4,
            "__v": 0,
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
            ],
            "modified": "2018-05-26T19:03:00.000Z",
            "created": "2018-05-26T19:03:00.000Z"
        }
    ],
    findAllComments_pending: [
        {
            "_id": "5b09af5c6cd9dd193a6305cf",
            "comment": "This is comment 1",
            "domain": "test",
            "creator": "58fc2095b33ef700014359af",
            "modified_by": "58fc2095b33ef700014359af",
            "target_id": "5b09ac18e1e7441830460087",
            "__v": 0,
            "status": "pending",
            "dimensions": [],
            "modified": "2018-05-26T19:01:00.000Z",
            "created": "2018-05-26T19:01:00.000Z"
        },
        {
            "_id": "5b09afdd523e6e1957c83c74",
            "comment": "This is comment 4",
            "domain": "test",
            "creator": "58fc2095b33ef700014359af",
            "modified_by": "58fc2095b33ef700014359af",
            "target_id": "5b09ac18e1e7441830460087",
            "overall_rating": 4,
            "__v": 0,
            "status": "pending",
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
    ],
    findAllCommentsOfParent_1: [
        {
            "_id": "5b09b06b523e6e1957c83c7c",
            "parent_id": "5b09afee523e6e1957c83c76",
            "comment": "This is comment 5 reply",
            "domain": "test",
            "creator": "58fc2095b33ef700014359af",
            "modified_by": "58fc2095b33ef700014359af",
            "target_id": "5b09ac18e1e7441830460087",
            "__v": 0,
            "status": "published",
            "dimensions": [],
            "modified": "2018-05-26T19:03:00.000Z",
            "created": "2018-05-26T19:03:00.000Z"
        }
    ],
    findAllComments_forcePublished: [
        {
            "_id": "5b09af5c6cd9dd193a6305cf",
            "comment": "This is comment 1",
            "domain": "test",
            "creator": "58fc2095b33ef700014359af",
            "modified_by": "58fc2095b33ef700014359af",
            "target_id": "5b09ac18e1e7441830460087",
            "__v": 0,
            "status": "published",
            "dimensions": [],
            "modified": "2018-05-26T19:01:00.000Z",
            "created": "2018-05-26T19:01:00.000Z"
        },
        {
            "_id": "5b09afb6523e6e1957c83c70",
            "comment": "This is comment 2",
            "target_id": "5b09ac18e1e7441830460087",
            "creator": "58fc2095b33ef700014359af",
            "domain": "test",
            "modified_by": "58fc2095b33ef700014359af",
            "overall_rating": 2.5,
            "status": "published",
            "dimensions": [
                {
                    "name": "reliability",
                    "rating": 1
                },
                {
                    "name": "fairness",
                    "rating": 4
                }
            ],
            "modified": "2018-06-11T22:06:00.000Z",
            "created": "2018-05-26T19:03:00.000Z"
        },
        {
            "_id": "5b09afdd523e6e1957c83c74",
            "comment": "This is comment 4",
            "domain": "test",
            "creator": "58fc2095b33ef700014359af",
            "modified_by": "58fc2095b33ef700014359af",
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
        },
        {
            "_id": "5b09afee523e6e1957c83c76",
            "comment": "This is comment 5",
            "domain": "test",
            "creator": "58fc2095b33ef700014359af",
            "modified_by": "58fc2095b33ef700014359af",
            "target_id": "5b09ac18e1e7441830460087",
            "overall_rating": 4,
            "__v": 0,
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
            ],
            "modified": "2018-05-26T19:03:00.000Z",
            "created": "2018-05-26T19:03:00.000Z"
        }
    ],
    getATarget_aggData: {
        "_id": "5b09ac18e1e7441830460087",
        "target_locator": "https://test",
        "type": "user",
        "domain": "test",
        "__v": 0,
        "active": true,
        "created": "2018-05-26T18:45:00.000Z",
        "dimensions": [
            {
                "name": "honesty",
                "overall_rating": 5
            },
            {
                "name": "fairness",
                "overall_rating": 3.3333333333333335
            },
            {
                "name": "reliability",
                "overall_rating": 3
            }
        ],
        "average_rating": 3.5
    },
    targetCreated: {
        _id: "5b09ac18e1e7441830460087",
        target_locator: 'https://test',
        type: 'user',
        created: "2018-05-26T18:45:00.000Z",
        domain: 'test',
        active: true
    },
    targetUpdated: {
        _id: "5b09ac18e1e7441830460087",
        target_locator: 'https://test',
        type: 'property',
        created: "2018-05-26T18:45:00.000Z",
        domain: 'test',
        active: true
    },
    commentCreated: {
        _id: '1b09ac18e1e7441830460000',
        target_id: "5b09ac18e1e7441830460087",
        created: "2018-05-26T18:45:00.000Z",
        creator: "58fc2095b33ef700014359af",
        modified: "2018-05-26T18:45:00.000Z",
        parent_id: null,
        modified_by: "58fc2095b33ef700014359af",
        comment: "This is a comment",
        domain: "test",
        __v: 0,
        dimensions: [
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
        ],
        overall_rating: 4,
        status: "pending"
    },
    commentUpdated: {
        _id: '1b09ac18e1e7441830460000',
        target_id: "5b09ac18e1e7441830460087",
        created: "2018-05-26T18:45:00.000Z",
        creator: "58fc2095b33ef700014359af",
        modified: "2018-05-26T18:45:00.000Z",
        parent_id: null,
        modified_by: "58fc2095b33ef700014359af",
        comment: "This is a comment",
        domain: "test",
        __v: 1,
        dimensions: [
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
        ],
        overall_rating: 4,
        status: "published"
    },
    targetAggregateComments: [
        {
            "_id": "reliability",
            "overall_rating": 5
        },
        {
            "_id": "fairness",
            "overall_rating": 2
        },
        {
            "_id": "honesty",
            "overall_rating": 3
        }
    ]
}