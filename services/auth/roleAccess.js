import Access from 'accesscontrol';
const ac = new Access();

ac.grant(['guest', 'landlord', 'merchant'])
    .createAny('comment')
    .updateOwn('comment')
    .readAny('comment')
    .readAny('comments')
    .readAny('target')
    .readAny('root')
    .deleteOwn('comment');

ac.grant(['superAdmin', 'productAdmin', 'productManager', 'domainAdmin', 'domainManager'])
    .extend('guest')
    .createAny('target')
    .updateAny('comment')
    .updateAny('target')
    .deleteAny('comment')
    .deleteAny('target')
    .deleteAny('logs');

export default ac;