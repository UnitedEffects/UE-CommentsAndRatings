import express from 'express';
import comApi from '../services/comrate/api';
import log from '../services/log/api';
import auth from '../services/auth/api';
import rbac from '../services/auth/roleApi';

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

router.get('/comments/:domain', [auth.isBearerAuthenticated, rbac.middle], comApi.getComments);
router.get('/comment/:domain/:id', auth.isBearerAuthenticated, comApi.getComment); //check own in function
router.post('/comment/:domain', [auth.isBearerAuthenticated, rbac.middle], comApi.postComment);
router.put('/comment/:domain/:id', auth.isBearerAuthenticated, comApi.putComment); //check own in function
router.delete('/comment/:domain/:id', auth.isBearerAuthenticated, comApi.deleteComment); //check own in function
router.get('/target/:domain/', [auth.isBearerAuthenticated, rbac.middle], comApi.getOverallTarget);
router.post('/target/:domain', [auth.isBearerAuthenticated, rbac.middle], comApi.createTarget);
router.patch('/target/:domain/:id', [auth.isBearerAuthenticated, rbac.middle], comApi.patchTarget);
router.delete('/target/:domain/:id', [auth.isBearerAuthenticated, rbac.middle], comApi.deleteTarget);

/**
 * Log API Calls
 */
router.get('/logs', auth.isBearerAuthenticated, log.getLogs);
router.get('/logs/:code', auth.isBearerAuthenticated, log.getLogByCode);
router.get('/logs/:code/:timestamp', auth.isBearerAuthenticated, log.getLog);
router.post('/logs', auth.isBearerAuthenticated, log.writeLog);

export default router;
