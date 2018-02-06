import mongoose from 'mongoose';
mongoose.Promise = Promise;
import moment from 'moment';
const config = require('../../../config');

const targetSchema = new mongoose.Schema({
    target_locator: {
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
    overall_values: [Number],
    dimensions: [
        {
            name: String,
            dimension_values: [Number]
        }
    ]
});


targetSchema.pre('save', callback => callback());

export default mongoose.model('target', targetSchema);
