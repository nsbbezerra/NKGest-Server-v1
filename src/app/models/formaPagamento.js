const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const FormaPagamentoSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    accountBank: {
        type: Schema.Types.ObjectId,
        ref: 'ContasBancarias',
        required: true
    },
    maxParcela: {
        type: Number,
        required: true
    },
    intervalDays: {
        type: Number,
        required: true
    },
    statusPay: {
        type: String,
        enum: ['vista', 'parc'],
        required: true,
    },
    boleto: {
        type: Boolean,
        required: true
    },
    cheque: {
        type: Boolean,
        required: true
    },
    credito: {
        type: Boolean,
        required: true
    },
    accData: {
        type: Boolean,
        required: true
    }

});

const formaPagamento = mongoose.model('FormaPagamento', FormaPagamentoSchema);

module.exports = formaPagamento;