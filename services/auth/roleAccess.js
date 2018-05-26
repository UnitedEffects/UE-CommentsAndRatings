import Access from 'accesscontrol';
const ac = new Access();

ac.grant(['guest', 'landlord', 'merchant'])
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