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
    const swag = yaml.load('./swagger.yaml');
    if (process.env.SWAG_DOM) swag.host = process.env.SWAG_DOM;
    res.json(swag);
});

export default router;
