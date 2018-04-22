/**
 * Created by bmotlagh on 10/19/17.
 */

import Joi from 'joi';
import responder from '../responder';
import send from '../response';
import dal from './dal';
import config from '../../config';

export default {
    getTargets (req, res) {
        return dal.getTargets()
            .then(output => responder.send(res, output))
            .catch(error => responder.send(res, error));
    },
    createTarget(req, res) {
        const target = req.body;
        target.domain = req.params.domain;
        const schema = Joi.object({ allowUnknown: false }).keys({
            target_locator: Joi.string().required(),
            type: Joi.string().valid(config.TARGET_TYPES).required(),
            domain: Joi.string().required(),
        });

        return Joi.validate(target, schema)
            .then(result => dal.createTarget(target))
            .then(output => responder.send(res, output))
            .catch((error) => {
                if(error.isJoi) return responder.send(res, send.fail400(error));
                return responder.send(res, error)
            });
    },
    deleteTarget(req, res) {
        //this will attempt to delete any comments from this target as well
        const data = {
            id: req.params.id,
            domain: req.params.domain
        };
        let targetStatus = send.fail400('Default value - unknown error');
        return dal.deleteTarget(data)
            .then((output) => {
                targetStatus = output;
                return dal.deleteCommentsOfTarget(data)
            })
            .then(output => responder.send(res, targetStatus))
            .catch(error => responder.send(res, error));

    },
    patchTarget(req, res) {
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

        return Joi.validate(data.update, schema)
            .then(result => dal.patchTarget(data))
            .then(output => responder.send(res, output))
            .catch((error) => {
                if(error.isJoi) return responder.send(res, send.fail400(error));
                return responder.send(res, error)
            });
    },
    postComment(req, res) {
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

        return Joi.validate(comment, schema)
            .then(result => dal.verifyTarget(comment.target_locator, comment.domain, comment.type))
            .then((target) => {
                if(!target) return send.fail400('Unknown Error: Could not identify a target for the comment');
                comment.target_id = target._id;
                return dal.postComment(comment);
            })
            .then(output => responder.send(res, output))
            .catch((error) => {
                if(error.isJoi) return responder.send(res, send.fail400(error));
                return responder.send(res, error)
            });



    },
    putComment(req, res) {
        /**
         * Do all required fields exist?
         * Don't allow update to target
         * Does the comment exist? If not, error
         * Update value of comment
         * If status of comment is 'approved', update target
         * Respond
         * Async: If status of comment is not approved, search and remove comment from target aggregates
         */
    },
    deleteComment(req, res) {
        /**
         * Do all required fields exist?
         * Does the target exist? If not, error
         * Does the comment exist? If not, error
         * Delete comment
         * Respond
         * Async: Remove comment from target aggregates
         */
    },
    getComments(req, res) {
        /**
         * Performs well
         * Limit response to 500
         * req.query.parentId?
         * req.query.locator?
         * req.query.targetId?
         * Get Target using locator
         * Get All Comments using target_id and return as is
         */
    },
    getComment(req, res) {
        /**
         * just works from ID
         */
    },
    getOverallTarget(req, res) {
        /**
         * Slower response
         * Get Target using locator (req.query.locator)
         * Get All Comments using target_id
         * Calculate dimension average values
         * Identify number of comments and add to response body
         * Identify average rating overall by calculating across all comments
         */
    }
}
