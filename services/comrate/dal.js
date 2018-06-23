/**
 * Created by bmotlagh on 10/19/17.
 */

import log from '../log/logs';
import send from '../response';
import Target from './models/target';
import Comment from './models/comment';
const config = require('../../config');

export default {
    async createTarget(data) {
        try {
            const target = new Target(data);
            return send.set200(await target.save(), 'Target');
        } catch (error) {
            log.detail('ERROR', 'Could not save target', error);
            if(error.code===11000) throw send.fail409('This target already exists');
            throw send.fail400(error);
        }
    },
    async getTargets() {
        try {
            return send.set200(await Target.find({}), 'Targets');
        } catch (error) {
            log.detail('ERROR', 'Could not retrieve targets', error);
            throw send.fail400(error);
        }
    },
    async deleteTarget(data) {
        try {
            const removed = await Target.findOneAndRemove({ _id: data.id, domain: data.domain });
            if(!removed) return send.fail404(data);
            return send.set200(removed, 'Target');
        } catch (error) {
            log.detail('ERROR', 'Could not delete target', error);
            throw send.fail400(error);
        }
    },
    async patchTarget(data) {
        try {
            return send.set200(await Target.findOneAndUpdate({ _id: data.id, domain: data.domain }, data.update, { new: true, runValidators: true }), 'Target');
        } catch (error) {
            log.detail('ERROR', 'Could not save target', error);
            if(error.code===11000) throw send.fail409('Could not make this update, duplicate entry would result.');
            throw send.fail400(error);
        }
    },
    async deleteCommentsOfTarget(data) {
        try {
            return send.set200(await Comment.deleteMany({ target_id: data.id, domain: data.domain }), 'Comments');
        } catch (error) {
            log.detail('ERROR', 'Could not delete comments', error);
            throw send.fail400(error);
        }
    },
    async verifyTarget(locator, domain, type) {
        try {
            const t1 = await Target.findOne({ target_locator: locator, domain: domain, type: type });
            if(!t1){
                const target = new Target({
                    target_locator: locator,
                    domain,
                    type
                });
                return await target.save();
            }
            return t1;
        } catch (error) {
            log.detail('ERROR', 'Could not save target', error);
            if(error.code===11000) throw send.fail409('Duplicate error. You may be attempting to create a comment against an existing target but with the wrong Type (not the same as the target). This Error is within VerifyTarget.');
            throw send.fail400(error);
        }
    },
    async postComment(data) {
        try {
            const overall = await returnOverAllForOneComment(data);
            if(overall) data.overall_rating = overall;
            const comment  = new Comment(data);
            return send.set200(await comment.save(), 'Comment');
        } catch (error) {
            log.detail('ERROR', 'Could not save comment', error);
            if(error.code===11000) throw send.fail409('This comment may be a duplicate...');
            throw send.fail400(error);
        }
    },
    async findTargetFromLocator(query, domain) {
        try {
            if(query.targetId) return query.targetId;
            const target = await Target.findOne({ target_locator: query.locator, domain: domain });
            if(!target) return send.fail404({ target_locator: query.locator, domain: domain });
            return target._id;
        } catch (error) {
            throw send.fail400(error);
        }
    },
    async getComments(query) {
        try {
            const count = await Comment.find(query).count();
            const comments = await Comment.find(query).limit(1000);
            return send.set200({ count: count, comments: comments}, 'Comments');
        } catch (error) {
            throw send.fail400(error);
        }
    },
    async getComment(id, domain) {
        try {
            const com = await Comment.findOne({ _id: id, domain: domain });
            if(!com) return send.fail404({ _id: id, domain: domain });
            return send.set200(com, 'Comment');
        } catch (error) {
            throw send.fail400(error);
        }
    },
    async getTargetByLocOrId(query, domain) {
        try {
            let search = {
                domain: domain
            };
            if (query.targetId) search._id = query.targetId;
            else search.target_locator = query.locator;
            const target = await Target.findOne(search);
            if(!target) return send.fail404(search);
            return send.set200(target, 'Target');
        } catch (error) {
            throw send.fail400(error);
        }
    },
    async calculateOverall(id) {
        try {
            return Comment.aggregate([
                {   "$match": { "target_id": id.toString(), parent_id: undefined, status: config.APPROVAL_STATUS_WORD } },
                {   "$limit": 1000 },
                {   "$unwind": "$dimensions" },
                {   "$group": {
                    _id: '$dimensions.name',
                    overall_rating: {$avg: "$dimensions.rating"}
                    }
                }
            ]);
        } catch (error) {
            throw send.fail400(error);
        }

    },
    async calculateAverageRating(id) {
        try {
            return Comment.aggregate([
                {   "$match": { "target_id": id.toString(), parent_id: undefined, status: config.APPROVAL_STATUS_WORD } },
                {   "$limit": 1000 },
                {   "$group": {
                    _id: id,
                    average_rating: {$avg: "$overall_rating"}
                }
                }
            ]);
        } catch (error) {
            throw send.fail400(error);
        }
    },
    async deleteComment(id, domain) {
        try {
            const result = await Comment.findOneAndRemove({ _id: id, domain: domain });
            if(!result) return send.fail404({ _id: id, domain: domain });
            return send.set200(result, 'Comment');
        } catch (error) {
            throw send.fail400(error);
        }
    },
    async putComment(id, domain, data) {
        try {
            const overall = await returnOverAllForOneComment(data);
            if(overall) data.overall_rating = overall;
            const result = await Comment.findOneAndUpdate({ _id: id, domain: domain }, data, { new: true, runValidators: true });
            if(!result) return send.fail404({ id: id, domain: domain, update: data });
            return send.set200(result, 'Comment');
        } catch (error) {
            throw send.fail400(error);
        }
    }
};

async function returnOverAllForOneComment (comment) {
    try {
        if (!comment.dimensions) return null;
        let count = 0;
        let total = 0;
        await Promise.all(comment.dimensions.map((dim) => {
            count++;
            total = total+dim.rating;
        }));
        return total/count;
    } catch (error) {
        throw send.fail400(error);
    }
}