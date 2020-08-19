const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const ComissionSchema = new Schema({

    funcionario: {
        type: Schema.Types.ObjectId,
        ref: 'Funcionarios',
        required: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Ordens',
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['wait', 'send'],
        required: true,
        default: 'wait'
    },
    createDate: {
        type: Date,
        default: Date.now(),
        required: true
    }

});

const comissions = mongoose.model('Comissoes', ComissionSchema);

module.exports = comissions;