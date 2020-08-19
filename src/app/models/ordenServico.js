const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const OrderServicoSchema = new Schema({

    client: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true
    },
    number: Number,
    funcionario: {
        type: Schema.Types.ObjectId,
        ref: 'Funcionarios',
        required: true
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Enderecos',
        required: true
    },
    veicles: {
        type: Schema.Types.ObjectId,
        ref: 'Veiculos',
    },
    services: [{
        quantity: Number,
        service: {
            type: Schema.Types.ObjectId,
            ref: 'Servicos'
        },
        name: {
            type: String
        },
        valueUnit: {
            type: Number
        },
        valueTotal: {
            type: Number
        }
    }],
    statuSales: {
        type: String,
        enum: ['orca', 'sale', 'wait'],
        required: true
    },
    statusPay: {
        type: String,
        enum: ['wait', 'pay'],
        required: true,
        default: 'wait'
    },
    desconto: {
        type: Number
    },
    valueLiquido: {
        type: Number,
    },
    valueBruto: {
        type: Number,
    },
    createDate: {
        type: String,
        required: true
    },
    dateSave: {
        type: Date,
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
    planoDeConta: {
        type: Schema.Types.ObjectId,
        ref: 'PlanoContas',
        required: true
    },
    waiting: {
        type: String,
        enum: ['none', 'yes', 'cancel'],
        required: true
    },
    finish: {
        type: String,
        enum: ['no', 'yes'],
        required: true,
        default: 'no'
    },
    payments: [{
        paymentName: String,
        paymentParcela: Number,
        paymentValue: Number
    }],
    nfse: {
        type: Boolean,
        required: true,
        default: false
    },
    nfseStatus: String,
    danfeUrl: String,
    xmlUrl: String,
    caixa: {
        type: String
    },
    boleto: {
        type: Boolean,
        required: true,
        default: false
    },
    obs: String,
    rascunho: Boolean
});

const ordersServico = mongoose.model('OrdensServico', OrderServicoSchema);

module.exports = ordersServico;
