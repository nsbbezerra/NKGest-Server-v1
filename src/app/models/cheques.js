const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const ChequeSchema = new Schema({

    client: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true
    },
    number: {
        type: String,
        required: true
    },
    entity: {
        type: String,
        required: true
    },
    situation: {
        type: String,
        enum: ['wait', 'done'],
        required: true
    },
    type: {
        type: String,
        enum: ['vista', 'prazo'],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    emitDate: {
        type: String,
        required: true
    },
    vencimento: {
        type: Date,
        required: true
    },
    obs: {
        type: String,
        required: true
    }

});

const cheques = mongoose.model('Cheques', ChequeSchema);

module.exports = cheques;
