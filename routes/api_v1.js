import express from 'express';
import apicache from 'apicache'
import comApi from '../services/comrate/api';
import log from '../services/log/api';
import auth from '../services/auth/api';
import rbac from '../services/auth/roleApi';
const config = require('../config');

const pJson = require('../package.json');

const router = express.Router();
let cache = apicache.middleware;

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

router.get('/comments/:domain', [auth.isBearerAuthenticated, rbac.middle, cache(config.CACHE)], comApi.getComments);
router.get('/comment/:domain/:id', auth.isBearerAuthenticated, comApi.getComment);
router.post('/comment/:domain', [auth.isBearerAuthenticated, rbac.middle], comApi.postComment);
router.put('/comment/:domain/:id', auth.isBearerAuthenticated, comApi.putComment);
router.delete('/comment/:domain/:id', auth.isBearerAuthenticated, comApi.deleteComment);

router.get('/target/:domain/', [auth.isBearerAuthenticated, rbac.middle, cache(config.CACHE)], comApi.getOverallTarget);
router.post('/target/:domain', [auth.isBearerAuthenticated, rbac.middle], comApi.createTarget);
router.patch('/target/:domain/:id', [auth.isBearerAuthenticated, rbac.middle], comApi.patchTarget);
router.delete('/target/:domain/:id', [auth.isBearerAuthenticated, rbac.middle], comApi.deleteTarget);

/**
 * Dimensions API
 */
router.get('/dimensions/', auth.isBearerAuthenticated, (req, res) => {
    res.json(config.TARGET_DIMENSIONS)
});
router.get('/dimensions/types', auth.isBearerAuthenticated, async (req, res) => {
    const typeArray = [];
    await config.TARGET_DIMENSIONS.map((dim) => {
        typeArray.push(dim.type);
    });
    return res.json(typeArray);
});
router.get('/dimensions/type/:type', auth.isBearerAuthenticated, async (req, res) => {
    let typeDims = {};
    let status = 404;
    await config.TARGET_DIMENSIONS.map((dim) => {
        if(req.params.type === dim.type) {
            status = 200;
            typeDims = JSON.parse(JSON.stringify(dim));
        }
    });
    return res.status(status).json(typeDims);
});
router.get('/dimensions/type/:type/dimension/:dimension', auth.isBearerAuthenticated, async (req, res) => {
    let status = 404;
    await config.TARGET_DIMENSIONS.map((dim) => {
        if(req.params.type === dim.type && dim.dimensions.includes(req.params.dimension)) status = 200;
    });
    return res.status(status).json((status === 200) ? {valid: true} : {valid: false});
});

/**
 * Log API Calls
 */
router.get('/logs', auth.isBearerAuthenticated, log.getLogs);
router.get('/logs/:code', auth.isBearerAuthenticated, log.getLogByCode);
router.get('/logs/:code/:timestamp', auth.isBearerAuthenticated, log.getLog);
router.post('/logs', auth.isBearerAuthenticated, log.writeLog);

export default router;
