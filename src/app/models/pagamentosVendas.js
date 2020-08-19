const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const PagamentoVendasSchema = new Schema({

    orders: {
        type: Schema.Types.ObjectId,
        ref: 'Ordens',
        required: true
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true
    },
    title: {
        type: String,
        required: true  
    },
    value: {
        type: Number,
        required: true
    },
    statusPay: {
        type: String,
        enum: ['cancel', 'wait', 'pay'],
        required: true
    },
    datePay: {
        type: String,
        required: true
    },
    dateToPay: {
        type: Date,
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    planoDeConta: {
        type: Schema.Types.ObjectId,
        ref: 'PlanoContas',
        required: true
    },
    boleto: {
        type: Boolean,
        required: true,
        default: false
    },
    credito: {
        type: Boolean,
        required: true,
        default: false
    },
    cheque: {
        type: Boolean,
        required: true,
        default: false
    },
    accData: {
        type: Boolean,
        required: true,
        default: false
    },
    transactionId: {
        type: Number,
        default: null
    },
    boletoUrl: {
        type: String,
        default: null
    }
});

const pagamentos = mongoose.model('PagamentosVendas', PagamentoVendasSchema);

module.exports = pagamentos;