const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const Balancete = new Schema({

    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    receives: [{
        id: {
            type: String
        },
        description: {
            type: String
        },
        value: {
            type: Number
        }
    }],
    withdraw: [{
        id: {
            type: String
        },
        description: {
            type: String
        },
        value: {
            type: Number
        }
    }],
    saldoAnterior: {
        type: Number,
        required: true
    },
    entradas: {
        type: Number,
        required: true
    },
    saidas: {
        type: Number,
        required: true
    },
    saldoAtual: {
        type: Number,
        required: true
    },
    dataFechamento: {
        type: String,
        required: true
    },
    dateSave: {
        type: Date,
        default: Date.now()
    },
    anual: {
        type: Boolean,
        required: true,
        default: false
    }

});

const balancete = mongoose.model('Balancete', Balancete);

module.exports = balancete;
