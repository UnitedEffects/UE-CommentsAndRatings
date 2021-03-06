import mongoose from 'mongoose';
mongoose.Promise = Promise;
import moment from 'moment';
const config = require('../../../config');

const commentSchema = new mongoose.Schema({
    target_id: {
        type: String,
        required: true,
        index: true
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
    parent_id: mongoose.Schema.Types.ObjectId,
    modified_by: String,
    comment: String,
    domain: {
        type: String,
        required: true
    },
    dimensions: [
        {
            _id: false,
            name: String,
            rating: Number
        }
    ],
    overall_rating: Number,
    status: {
        type: String,
        enum: config.COMMENT_STATUS,
        default: config.COMMENT_DEFAULT_STATUS
    }
});


commentSchema.pre('save', callback => callback());

export default mongoose.model('comment', commentSchema);
