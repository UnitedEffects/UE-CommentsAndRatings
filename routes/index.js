import express from 'express';
import yaml from 'yamljs';
const config = require('../config');

const router = express.Router();
const pJson = require('../package.json');
/* GET index page. */
router.get('/', (req, res) => {
    let maintainer = 'bmotlagh@frontlineed.com';
    if (pJson.contributors) maintainer = pJson.contributors[0].email;
    res.render('index', {
        maintainer,
        implementer: config.IMPLEMENTER
    });
});

router.get('/swagger.json', (req, res) =>  {
    try{
        const swag = yaml.load('./swagger.yaml');
        swag.info.version = pJson.version;
        swag.info.description = swag.info.description.replace('{{IMPLEMENTER}}', config.IMPLEMENTER);
        if (config.SWAGGER) swag.host = config.SWAGGER;
        if (config.ENV.toLowerCase()==='production' || config.ENV.toLowerCase()==='qa') swag.schemes = ['https'];
        res.json(swag);
    }catch (error) {
        console.info(error);
        res.json(swag);
    }

});
export default router;
