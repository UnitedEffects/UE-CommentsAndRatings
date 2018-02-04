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
    IMPLEMENTER: process.env.IMPLEMENTER || 'United Effects LLC'
};

module.exports = config;
