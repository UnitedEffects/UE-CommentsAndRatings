import mongoose from 'mongoose';
mongoose.Promise = Promise;
import moment from 'moment';
const config = require('../../../config');

const commentSchema = new mongoose.Schema({
    target_id: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: config.TARGET_TYPES
    },
    created: {
        type: Date,
        default: moment().format('LLLL')
    },
    creator: String,
    modified: {
        type: Date,
        default: moment().format('LLLL')
    },
    modified_by: String,
    comment: String,
    dimensions: [
        {
            name: String,
            dimension_value: Number
        }
    ]
});


commentSchema.pre('save', callback => callback());

export default mongoose.model('comment', commentSchema);
