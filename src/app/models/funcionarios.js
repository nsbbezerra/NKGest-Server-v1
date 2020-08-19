const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const FuncionarioSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['fem', 'masc'],
        require: true
    },
    dateBirth: {
        type: String,
    },
    celOne: {
        type: String
    },
    celTwo: {
        type: String
    },
    email: {
        type: String
    },
    admin: {
        type: Boolean,
        require: true
    },
    sales: {
        type: Boolean,
        required: true
    },
    caixa: {
        type: Boolean,
        required: true
    },
    admission: {
        type: String,
    },
    comission: {
        type: Number
    },
    comissioned: {
        type: Boolean,
        required: true
    },
    user: {
        type: String
    },
    password: {
        type: String,
    },
    cargo: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }

});

const funcionarios = mongoose.model('Funcionarios', FuncionarioSchema);

module.exports = funcionarios;
