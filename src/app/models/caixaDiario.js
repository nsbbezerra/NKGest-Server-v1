const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const CaixaDiarioSchema = new Schema({

    funcionario: {
        type: Schema.Types.ObjectId,
        ref: 'Funcionarios',
        required: true
    },
    valueOpened: {
        type: Number,
        required: true
    },
    valueClosed: {
        type: Number,
        required: true,
    },
    saldo: {
        type: Number,
        required: true
    },
    movimentDate: {
        type: String,
    },
    status: {
        type: String,
        enum: ['open', 'close'],
        require: true,
        default: 'open'
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

const caixaDiario = mongoose.model('CaixaDiario', CaixaDiarioSchema);

module.exports = caixaDiario;