const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const PlanoContaSchema = new Schema({

    planoConta: {
        type: String,
        required: true
    },
    typeMoviment: {
        type: String,
        enum: ['debit', 'credit'],
        required: true
    }

});

const planoContas = mongoose.model('PlanoContas', PlanoContaSchema);

module.exports = planoContas;