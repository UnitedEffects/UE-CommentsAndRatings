import express from 'express';
import comApi from '../services/comrate/api';
import log from '../services/log/api';
import auth from '../services/auth/api';
import rbac from '../services/auth/roleApi';
const config = require('../config');

const pJson = require('../package.json');

const router = express.Router();

/**
 * You'll want to change these values
 */
router.get('/version', (req,res) => {
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
router.get('/comment/:domain/:id', auth.isBearerAuthenticated, comApi.getComment);
router.post('/comment/:domain', [auth.isBearerAuthenticated, rbac.middle], comApi.postComment);
router.put('/comment/:domain/:id', auth.isBearerAuthenticated, comApi.putComment);
router.delete('/comment/:domain/:id', auth.isBearerAuthenticated, comApi.deleteComment);
router.get('/target/:domain/', [auth.isBearerAuthenticated, rbac.middle], comApi.getOverallTarget);
router.post('/target/:domain', [auth.isBearerAuthenticated, rbac.middle], comApi.createTarget);
router.patch('/target/:domain/:id', [auth.isBearerAuthenticated, rbac.middle], comApi.patchTarget);
router.delete('/target/:domain/:id', [auth.isBearerAuthenticated, rbac.middle], comApi.deleteTarget);


/**
 * todo
 * Add unit tests
 * Validate role permissions...
 * Update readme


 //THESE ARE FOR TESTING ONLY AND WILL BE REMOVED
router.get('/comments/:domain', comApi.getComments);
router.get('/comment/:domain/:id', comApi.getComment);
router.post('/comment/:domain', comApi.postComment);
router.put('/comment/:domain/:id', comApi.putComment);
router.delete('/comment/:domain/:id', comApi.deleteComment);
router.get('/target/:domain/', comApi.getOverallTarget);
router.post('/target/:domain', comApi.createTarget);
router.patch('/target/:domain/:id', comApi.patchTarget);
router.delete('/target/:domain/:id', comApi.deleteTarget);

//keep this for future testing
router.get('/targets', comApi.getTargets);
*/

/**
 * Log API Calls
 */
router.get('/logs', auth.isBearerAuthenticated, log.getLogs);
router.get('/logs/:code', auth.isBearerAuthenticated, log.getLogByCode);
router.get('/logs/:code/:timestamp', auth.isBearerAuthenticated, log.getLog);
router.post('/logs', auth.isBearerAuthenticated, log.writeLog);

export default router;
