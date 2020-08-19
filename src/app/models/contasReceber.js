const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const ContasReceberSchema = new Schema({

    planContas: {
        type: Schema.Types.ObjectId,
        ref: 'PlanoContas',
        required: true
    },
    payForm: {
        type: Schema.Types.ObjectId,
        ref: 'FormaPagamento',
        required: true
    },
    accountBank: {
        type: Schema.Types.ObjectId,
        ref: 'ContasBancarias',
        required: true
    },
    vencimento: {
        type: Date,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    statusPay: {
        type: String,
        enum: ['cancel', 'wait', 'pay'],
        required: true,
    },
    createDate: {
        type: String,
        required: true
    },
    dateSave: {
        type: Date,
        default: Date.now(),
        required: true
    },
    description: {
        type: String
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    }

});

const contasReceber = mongoose.model('ContasReceber', ContasReceberSchema);

module.exports = contasReceber;