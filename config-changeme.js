/**
 * Created by bmotlagh on 10/22/17.
 */

const config = {
    ENV: process.env.NODE_ENV || 'dev',
    SWAGGER: process.env.SWAGGER || 'localhost:3000',
    MONGO: process.env.MONGO || 'mongodb://localhost:27017/ue-boilerplate',
    REPLICA: process.env.REPLICA || 'rs0',
    UEAUTH: process.env.UEAUTH || 'https://domain.unitedeffects.com',
    WEBHOOK: process.env.WEBHOOK || 'YOURWEBHOOKVALUE',
    PRODUCT_SLUG: process.env.PRODUCT_SLUG || 'your_product_slug',
    IMPLEMENTER: process.env.IMPLEMENTER || 'United Effects LLC',
    /**
     * Configure the below for your needs. Each type is a general target for comments. Dimensions allow
     * a granular review.
     */
    TARGET_TYPES: ['type1', 'type2', 'type3'],
    TARGET_DIMENSIONS: [
        {
            type: 'type1',
            dimensions: ['reliability', 'honesty', 'fairness']
        },
        {
            type: 'type2',
            dimensions: ['accuracy', 'communication', 'cleanliness', 'location', 'value']
        },
        {
            type: 'type3',
            dimensions: ['value', 'quality', 'service', 'accuracy']
        }
    ]
};

module.exports = config;
