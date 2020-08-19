const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const MovimentacaoCaixa = new Schema({

    idCaixa: {
        type: Schema.Types.ObjectId,
        ref: 'CaixaDiario',
        required: true
    },
    typeMoviment: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createDate: {
        type: String,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    }

});

const movimentacaoCaixa = mongoose.model('MovimentacaoCaixa', MovimentacaoCaixa);

module.exports = movimentacaoCaixa;