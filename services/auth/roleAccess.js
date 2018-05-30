import Access from 'accesscontrol';
import config from '../../config';

const ac = new Access();
const baseAccess = config.BASE_ACCESS.split(',');

ac.grant(baseAccess)
    .createAny('comment')
    .createAny('target')
    .updateOwn('comment')
    .readAny('comment')
    .readAny('comments')
    .readAny('target')
    .readAny('root')
    .deleteOwn('comment');

ac.grant(['superAdmin', 'productAdmin', 'productManager', 'domainAdmin', 'domainManager'])
    .extend('guest')
    .updateAny('comment')
    .updateAny('target')
    .deleteAny('comment')
    .deleteAny('target')
    .deleteAny('logs');

export default ac;