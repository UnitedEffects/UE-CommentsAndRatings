/**
 * Created by bmotlagh on 10/19/17.
 */

import log from '../log/logs';
import send from '../response';
import Target from './models/target';
import Comment from './models/comment';

export default {
    createTarget(data) {
        return new Promise((resolve, reject) => {
            const target = new Target(data);
            target.save()
                .then(result => resolve(send.set200(result, 'Target')))
                .catch((error) => {
                    if(error.code===11000) return reject(send.fail409('This target already exists'));
                    log.detail('ERROR', 'Could not save target', error);
                    return reject(send.fail400(error))
                })
        })
    },
    getTargets() {
        return new Promise((resolve, reject) => {
            Target.find({})
                .then(result => resolve(send.set200(result, 'Targets')))
                .catch((error) => {
                    log.detail('ERROR', 'Could not retrieve targets', error);
                    return reject(send.fail400(error))
                })
        })
    },
    deleteTarget(data) {
        return new Promise((resolve, reject) => {
            Target.findOneAndRemove({ _id: data.id, domain: data.domain })
                .then(result => resolve(send.set200(result, 'Target')))
                .catch((error) => {
                    log.detail('ERROR', 'Could not delete target', error);
                    return reject(send.fail400(error))
                });
        })
    },
    patchTarget(data) {
        return new Promise((resolve, reject) => {
            Target.findOneAndUpdate({ _id: data.id, domain: data.domain }, data.update, { new: true })
                .then(result => resolve(send.set200(result, 'Target')))
                .catch((error) => {
                    if(error.code===11000) return reject(send.fail409('Could not make this update, duplicate entry would result.'));
                    log.detail('ERROR', 'Could not save target', error);
                    return reject(send.fail400(error))
                })
        })
    },
    deleteCommentsOfTarget(data) {
        return new Promise((resolve, reject) => {
            Comment.deleteMany({ target_id: data.id, domain: data.domain })
                .then(result => resolve(send.set200(result, 'Comments')))
                .catch((error) => {
                    log.detail('ERROR', 'Could not delete comments', error);
                    return reject(send.fail400(error))
                });
        })
    },
    verifyTarget(locator, domain, type) {
        return new Promise((resolve, reject) => {
            Target.findOne({ target_locator: locator, domain: domain, type: type })
                .then((result) => {
                    if(!result) {
                        const target = new Target({
                            target_locator: locator,
                            domain,
                            type
                        });
                        return target.save();
                    }
                    return result;
                })
                .then(aTarget => resolve(aTarget))
                .catch((error) => {
                    if(error.code===11000) return reject(send.fail409('Duplicate error. You may be attempting to create a comment against an existing target but with the wrong Type (not the same as the target). This Error is within VerifyTarget.'));
                    log.detail('ERROR', 'Could not save target', error);
                    return reject(send.fail400(error))
                })
        })
    },
    postComment(data) {
        return new Promise((resolve, reject) => {
            returnOverAllForOneComment(data)
                .then((overall) => {
                    if(overall) data.overall_rating = overall;
                    return data;
                })
                .then((comment) => {
                    const com = new Comment(comment);
                    return com.save();
                })
                .then(result => resolve(send.set200(result, 'Comment')))
                .catch((error) => {
                    if(error.code===11000) return reject(send.fail409('This comment may be a duplicate...'));
                    log.detail('ERROR', 'Could not save comment', error);
                    return reject(send.fail400(error))
                })

        })
    },
    findTargetFromLocator(query) {
        return new Promise((resolve, reject) => {
            if(query.targetId) return resolve(query.targetId);
            Target.findOne({ target_locator: query.locator })
                .then((target) => {
                    if(!target) return reject(send.fail404(query));
                    return resolve(target._id);
                })
                .catch(error => reject(send.fail400(error)));
        })
    },
    getComments(query) {
        return new Promise((resolve, reject) => {
            let count = 0;
            Comment.find(query).count()
                .then((i) => {
                    count = i;
                    return Comment.find(query).limit(1000)
                })
                .then(comments => resolve(send.set200({ count: count, comments: comments}, 'Comments')))
                .catch(error => reject(send.fail400(error)));
        })
    },
    getComment(id) {
        return new Promise((resolve, reject) => {
            Comment.findOne({ _id: id })
                .then((com) => {
                    if(!com) return reject(send.fail404(id));
                    return resolve(send.set200(com, 'Comment'));
                })
                .catch(error => reject(send.fail400(error)));
        })
    }

};

function returnOverAllForOneComment (comment) {
    return new Promise(async (resolve, reject) => {
        if(!comment.dimensions) return resolve(null);
        let count = 0;
        let total = 0;
        await Promise.all(comment.dimensions.map((dim) => {
            count++;
            total = total+dim.rating;
        }))
            .then(() => resolve(total/count))
            .catch(error => reject(send.fail400(error)));
    })
}
