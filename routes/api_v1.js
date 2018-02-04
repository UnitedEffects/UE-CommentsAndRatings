import express from 'express';
import email from '../services/yourservice/api';
import log from '../services/log/api';
import auth from '../services/auth/api';

const pJson = require('../package.json');

const router = express.Router();

/**
 * You'll want to change these values
 */
router.get('/', (req,res) => {
    res.json({
        service: 'United Effects Comments and Ratings Service',
        license: 'MIT',
        implementer: config.IMPLEMENTER,
        git: 'https://github.com/UnitedEffects/UE-CommentsAndRatings',
        api: 'REST',
        version: pJson.version,
        currentMaintainers: pJson.contributors
    });
});

/* Your API Calls */
router.get('/helloworld', email.helloworld);

/**
 * Log API Calls
 */
router.get('/logs', auth.isBearerAuthenticated, log.getLogs);
router.get('/logs/:code', auth.isBearerAuthenticated, log.getLogByCode);
router.get('/logs/:code/:timestamp', auth.isBearerAuthenticated, log.getLog);
router.post('/logs', auth.isBearerAuthenticated, log.writeLog);

export default router;
