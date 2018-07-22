/**
 * Created by bmotlagh on 10/22/17.
 */

const config = {
    ENV: process.env.NODE_ENV || 'dev',
    SWAGGER: process.env.SWAGGER || 'localhost:4040',
    MONGO: process.env.MONGO || 'mongodb://localhost:27017/ue-comment-ratings',
    REPLICA: process.env.REPLICA || 'rs0',
    UEAUTH: process.env.UEAUTH || 'https://domainqa.unitedeffects.com',
    PRODUCT_SLUG: process.env.PRODUCT_SLUG || 'your_product_slug',
    IMPLEMENTER: process.env.IMPLEMENTER || 'United Effects LLC',
    BASE_ACCESS: process.env.BASE_ACCESS || 'guest',
    CACHE: process.env.CACHE || '2 minutes',
    /**
     * Configure the below for your needs. Each type is a general target for comments. Dimensions allow
     * a granular review.
     */
    APPROVAL_STATUS_WORD: 'approved', //THIS MUST MATCH THE BELOW
    COMMENT_STATUS: ['pending', 'approved', 'rejected'],
    COMMENT_DEFAULT_STATUS: 'pending',
    TARGET_TYPES: ['user', 'property', 'merchant'],
    MAX_POSSIBLE_RATING: 5,
    TARGET_DIMENSIONS: [
        {
            type: 'user',
            dimensions: ['reliability', 'honesty', 'fairness']
        },
        {
            type: 'property',
            dimensions: ['accuracy', 'communication', 'cleanliness', 'location', 'value']
        },
        {
            type: 'merchant',
            dimensions: ['value', 'quality', 'service', 'accuracy']
        }
    ]
};

module.exports = config;
