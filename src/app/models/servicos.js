const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const ServicoSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    description: String,
    value: {
        type: Number,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    createDate: {
        type: String,
        required: true
    }
});

const servicos = mongoose.model('Servicos', ServicoSchema);

module.exports = servicos;
