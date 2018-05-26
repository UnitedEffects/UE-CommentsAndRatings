import express from 'express';
import yaml from 'yamljs';

const router = express.Router();
const pJson = require('../package.json');
/* GET index page. */
router.get('/', (req, res) => {
    let maintainer = 'bmotlagh@frontlineed.com';
    if (pJson.contributors) maintainer = pJson.contributors[0].email;
    res.render('index', {
        maintainer
    });
});

router.get('/swagger.json', (req, res) =>  {
    try{
        const swag = yaml.load('./swagger.yaml');
        swag.info.version = pJson.version;
        if (process.env.SWAGGER) swag.host = process.env.SWAGGER;
        if (process.env.NODE_ENV.toLowerCase()==='production' || process.env.NODE_ENV.toLowerCase()==='qa') swag.schemes = ['https'];
        res.json(swag);
    }catch (error) {
        console.info(error);
        res.status(400).send(error);
    }

});
export default router;
