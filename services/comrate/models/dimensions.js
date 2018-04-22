/**
 * Probably going to delete this model...
 */

import mongoose from 'mongoose';
mongoose.Promise = Promise;
const config = require('../../../config');

const dimensionSchema = new mongoose.Schema({
    target_id: {
        type: String,
        required: true
    },
    comment_id: {
        type: String,
        required: true,
    },
    user_id: String,
    name: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
});


dimensionSchema.pre('save', callback => callback());

export default mongoose.model('dimensions', dimensionSchema);
