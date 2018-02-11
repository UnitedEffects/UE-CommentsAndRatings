import ac from './roleAccess';
import respond from '../responder';
import log from '../log/logs';
const config = require('../../config');

function getRole (user, domain) {
    return new Promise((resolve, reject) => {
        try {
            const role = [];
            if(user.role===1) role.push('superAdmin');
            if(user.permissions) if(user.permissions.product) if(user.permissions.product[config.PRODUCT_SLUG]) {
                if(user.permissions.product[config.PRODUCT_SLUG].admin) role.push('productAdmin');
            }
            if(user.permissions) if(user.permissions.product) if(user.permissions.product[config.PRODUCT_SLUG]) {
                if(user.permissions.product[config.PRODUCT_SLUG].manager) role.push('productManager');
            }
            if(domain){
                if(user.permissions) if(user.permissions.domain) if(user.permissions.domain[domain]) {
                    if(user.permissions.domain[domain].admin) role.push('domainAdmin');
                }
                if(user.permissions) if(user.permissions.domain) if(user.permissions.domain[domain]) {
                    if(user.permissions.domain[domain].manager) role.push('domainManager');
                }
                if(user.permissions) if(user.permissions.domain) if(user.permissions.domain[domain]) {
                    if(user.permissions.domain[domain].landlord) role.push('landlord');
                }
                if(user.permissions) if(user.permissions.domain) if(user.permissions.domain[domain]) {
                    if(user.permissions.domain[domain].merchant) role.push('merchant');
                }
            }
            if(role.length===0) role.push('guest');
            return resolve(role);
        } catch (e) {
            return reject(e);
        }
    })
}

const roleApi = {
    middle (req, res, next) {
        getRole(req.user, req.params.domain)
            .then(async (roles) => {
                let resource = req.path.split('/')[1];
                if (resource === '') resource = 'root';
                console.info(resource);
                console.info(req.params.domain);
                console.info(roles);
                let access = false;
                await Promise.all(roles.map((role) => {
                    switch (req.method) {
                        case 'GET':
                            if(!access){
                                if (ac.can(role).readAny(resource).granted) access = true;
                            }
                            break;
                        case 'PATCH':
                            if(!access) {
                                if (ac.can(role).updateAny(resource).granted) access = true;
                            }
                            break;
                        case 'PUT':
                            if(!access) {
                                if (ac.can(role).updateAny(resource).granted) access = true;
                            }
                            break;
                        case 'DELETE':
                            if(!access) {
                                if (ac.can(role).deleteAny(resource).granted) access = true;
                            }
                            break;
                        case 'POST':
                            if(!access) {
                                if (ac.can(role).createAny(resource).granted) access = true;
                            }
                            break;
                        default:
                            break;
                    }
                }));
                return access;
            })
            .then((access) => {
                if(access) return next();
                return respond.sendUnauthorized(res);
            })
            .catch((error) => {
                log.error(error);
                return respond.sendUnauthorized(res);
            })
    },
    rAny (req, domain, resource) {
        return new Promise((resolve, reject) => {
            getRole(req.user, domain)
                .then(async (roles) => {
                    if(!resource) resource = req.path.split('/')[1];
                    if (resource === '') resource = 'root';
                    let access = false;
                    await Promise.all(roles.map((role) => {
                        switch (req.method) {
                            case 'GET':
                                if(!access){
                                    if (ac.can(role).readAny(resource).granted) access = true;
                                }
                                break;
                            case 'PATCH':
                                if(!access) {
                                    if (ac.can(role).updateAny(resource).granted) access = true;
                                }
                                break;
                            case 'PUT':
                                if(!access) {
                                    if (ac.can(role).updateAny(resource).granted) access = true;
                                }
                                break;
                            case 'DELETE':
                                if(!access) {
                                    if (ac.can(role).deleteAny(resource).granted) access = true;
                                }
                                break;
                            case 'POST':
                                if(!access) {
                                    if (ac.can(role).createAny(resource).granted) access = true;
                                }
                                break;
                            default:
                                break;
                        }
                    }));
                    return resolve(access);
                })
                .catch(error => reject(error));
        })
    },
    rOwn (req, domain, resource) {
        return new Promise((resolve, reject) => {
            getRole(req.user, domain)
                .then(async (roles) => {
                    if(!resource) resource = req.path.split('/')[1];
                    if (resource === '') resource = 'root';
                    let access = false;
                    await Promise.all(roles.map((role) => {
                        switch (req.method) {
                            case 'GET':
                                if(!access){
                                    if (ac.can(role).readOwn(resource).granted) access = true;
                                }
                                break;
                            case 'PATCH':
                                if(!access) {
                                    if (ac.can(role).updateOwn(resource).granted) access = true;
                                }
                                break;
                            case 'PUT':
                                if(!access) {
                                    if (ac.can(role).updateOwn(resource).granted) access = true;
                                }
                                break;
                            case 'DELETE':
                                if(!access) {
                                    if (ac.can(role).deleteOwn(resource).granted) access = true;
                                }
                                break;
                            case 'POST':
                                if(!access) {
                                    if (ac.can(role).createOwn(resource).granted) access = true;
                                }
                                break;
                            default:
                                break;
                        }
                    }));
                    return resolve(access);
                })
                .catch(error => reject(error));
        })
    }
};

export default roleApi;