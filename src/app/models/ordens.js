const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({

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
    products: [{
        quantity: Number,
        code: String,
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Produtos'
        },
        name: {
            type: String
        },
        unidade: {
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
        enum: ['orca', 'sale'],
        required: true
    },
    statusPay: {
        type: String,
        enum: ['wait', 'pay'],
        required: true,
        default: 'wait'
    },
    payments: [{
        paymentName: String,
        paymentParcela: Number,
        paymentValue: Number
    }],
    waiting: {
        type: String,
        enum: ['none', 'yes', 'cancel'],
        required: true
    },
    desconto: {
        type: Number
    },
    valueDesconto: {
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
    finish: {
        type: String,
        enum: ['no', 'yes'],
        required: true,
        default: 'no'
    },
    notaFiscal: {
        type: String,
    },
    caixa: {
        type: String
    },
    boleto: {
        type: Boolean,
        required: true,
        default: false
    },
    obs: String,
    nfe: {
        type: Boolean,
        required: true,
        default: false
    },
    nfce: {
        type: Boolean,
        required: true,
        default: false
    },
    nfeStatus: String,
    nfceStatus: String,
    nfeDanfeUrl: String,
    nfceDanfeUrl: String,
    nfeXmlUrl: String,
    xmlCancUrl: String,
    nfceXmlUrl: String,
    rascunhoNFE: Boolean,
    rascunhoNFCE: Boolean,
    devolve: Boolean,
    correct: Boolean,
    statusCorrect: String,
    pdfCartaCorrect: String,
    xmlCartaCorrect: String,
    inutil: Boolean,
    inutilXml: String
});

const orders = mongoose.model('Ordens', OrderSchema);

module.exports = orders;
