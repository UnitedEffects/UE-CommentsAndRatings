/**
 * Created by bmotlagh on 10/19/17.
 */

import responder from '../responder';
import log from '../log/logs';

export default {
    postComment(req, res) {
        /**
         * Do all required fields exist?
         * Does the target exist? If not create the target.
         * Write the comment
         * If Status of comment is 'approved', update target
         */
    },
    createTarget(req, res) {
        /**
         * Do all required fields exist?
         * Create target
         */
    },
    patchTarget(req, res) {
        /**
         * dont allow updates to dimensions from here
         */
    },
    deleteTarget(req, res) {
        /**
         * This will decouple the relationship and orphan comments
         */
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
