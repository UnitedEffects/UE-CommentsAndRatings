/**
 * Created by bmotlagh on 10/19/17.
 */

import Joi from 'joi';
import responder from '../responder';
import send from '../response';
import dal from './dal';
import config from '../../config';

export default {
    async getTargets (req, res) {
        try{
            return responder.send(res, await dal.getTargets());
        } catch (error) {
            return responder.send(res, error);
        }
    },
    async createTarget(req, res) {
        try{
            const target = req.body;
            target.domain = req.params.domain;
            const schema = Joi.object({ allowUnknown: false }).keys({
                target_locator: Joi.string().required(),
                type: Joi.string().valid(config.TARGET_TYPES).required(),
                domain: Joi.string().required(),
            });
            await Joi.validate(target, schema);
            return responder.send(res, await dal.createTarget(target));
        } catch(error) {
            if(error.isJoi) return responder.send(res, send.fail400(error));
            return responder.send(res, error)
        }
    },
    async deleteTarget(req, res) {
        //this will attempt to delete any comments from this target as well
        try {
            const data = {
                id: req.params.id,
                domain: req.params.domain
            };
            const output = await dal.deleteTarget(data);
            await dal.deleteCommentsOfTarget(data);
            return responder.send(res, output);
        } catch (error) {
            return responder.send(res, error);
        }
    },
    async patchTarget(req, res) {
        try {
            const data = {
                id: req.params.id,
                domain: req.params.domain,
                update: req.body
            };
            const schema = Joi.object({ allowUnknown: false }).keys({
                target_locator: Joi.string(),
                type: Joi.string().valid(config.TARGET_TYPES),
                domain: Joi.string(),
                active: Joi.boolean()
            });
            await Joi.validate(data.update, schema);
            return responder.send(res, await dal.patchTarget(data));
        } catch (error) {
            if(error.isJoi) return responder.send(res, send.fail400(error));
            return responder.send(res, error)
        }
    },
    async postComment(req, res) {
        try {
            const comment = req.body;
            comment.domain = req.params.domain;
            comment.creator = (req.user) ? req.user._id : 'anonymous';
            comment.modified_by = (req.user) ? req.user._id : 'anonymous';
            const schema = Joi.object({ allowUnknown: false }).keys({
                target_locator: Joi.string().required(),
                creator: Joi.string().required(),
                modified_by: Joi.string().required(),
                parent_id: Joi.string(),
                domain: Joi.string().required(),
                type: Joi.string().valid(config.TARGET_TYPES).required(),
                comment: Joi.string().required(),
                dimensions: Joi.array().items(Joi.object({ allowUnknown: false }).keys({
                    name: Joi.string(),
                    rating: Joi.number().integer().min(1).max(config.MAX_POSSIBLE_RATING)
                }))
            });
            await Joi.validate(comment, schema);
            const target = await dal.verifyTarget(comment.target_locator, comment.domain, comment.type);
            if(!target) return responder.send(res, send.fail400('Unknown Error: Could not identify a target for the comment'));
            comment.target_id = target._id;
            return responder.send(res, await dal.postComment(comment));
        } catch (error) {
            if(error.isJoi) return responder.send(res, send.fail400(error));
            return responder.send(res, error)
        }
    },
    async getComments(req, res) {
        try {
            if (!req.query.locator && !req.query.targetId) responder.send(res, send.fail400('Either a locator or targetId is required. If both provided, ID is used.'));
            const tid = await dal.findTargetFromLocator(req.query);
            const query = {
                target_id: tid,
                parent_id: req.query.parentId
            };
            return responder.send(res, await dal.getComments(query));
        } catch (error) {
            return responder.send(res, error);
        }
    },
    async getComment(req, res) {
        try {
            return responder.send(res, await dal.getComment(req.params.id));
        } catch (error) {
            return responder.send(res, error);
        }
    },
    async putComment(req, res) {
        try {
            const comment = req.body;
            comment.domain = req.params.domain;
            comment.creator = (req.user) ? req.user._id : 'anonymous';
            comment.modified_by = (req.user) ? req.user._id : 'anonymous';
            const schema = Joi.object({ allowUnknown: false }).keys({
                target_locator: Joi.string().required(),
                creator: Joi.string().required(),
                modified_by: Joi.string().required(),
                parent_id: Joi.string(),
                domain: Joi.string().required(),
                type: Joi.string().valid(config.TARGET_TYPES).required(),
                comment: Joi.string().required(),
                dimensions: Joi.array().items(Joi.object({ allowUnknown: false }).keys({
                    name: Joi.string(),
                    rating: Joi.number().integer().min(1).max(config.MAX_POSSIBLE_RATING)
                }))
            });
            await Joi.validate(comment, schema);
            const target = await dal.verifyTarget(comment.target_locator, comment.domain, comment.type);
            if(!target) return responder.send(res, send.fail400('Unknown Error: Could not identify a target for the comment'));
            comment.target_id = target._id;
            return responder.send(res, await dal.putComment(req.params.id, comment));
        } catch (error) {
            if(error.isJoi) return responder.send(res, send.fail400(error));
            return responder.send(res, error)
        }
    },
    async deleteComment(req, res) {
        try {
            return responder.send(res, await dal.deleteComment(req.params.id));
        } catch (error) {
            return responder.send(res, error);
        }
    },
    async getOverallTarget(req, res) {
        try {
            if (!req.query.locator && !req.query.targetId) responder.send(res, send.fail400('Either a locator or targetId is required. If both provided, ID is used.'));
            const target = JSON.parse(JSON.stringify(await dal.getTargetByLocOrId(req.query)));
            target.data.dimensions = await dal.calculateOverall(target.data._id);
            target.data.average_rating = (await dal.calculateAverageRating(target.data._id))[0].average_rating;
            return responder.send(res, target);
        } catch (error) {
            return responder.send(res, error);
        }
    }
}
