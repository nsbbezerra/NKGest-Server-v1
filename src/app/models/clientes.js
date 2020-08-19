const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const ClientesModel = new Schema({

    name: {
        type: String,
        required: true,
    },
    cpf_cnpj: {
        type: String,
        required: true,
        unique: true
    },
    rg: {
        type: String
    },
    emitter: {
        type: String
    },
    dateBirth: {
        type: String
    },
    email: {
        type: String,
    },
    typeClient: {
        type: String,
        enum: ['fisic', 'juridic'],
        required: true
    },
    socialName: {
        type: String
    },
    stateRegistration: {
        type: String
    },
    municipalRegistration: {
        type: String
    },
    manager: {
        type: String
    },
    phoneComercial: {
        type: String
    },
    celOne: {
        type: String
    },
    celTwo: {
        type: String
    },
    obs: {
        type: String
    },
    active: {
        type: Boolean,
        default: true,
        required: true
    },
    restrict: {
        type: Boolean,
        default: false,
        required: true
    },
    createDate: {
        type: String,
        require: true
    }

});

const clientes = mongoose.model('Clientes', ClientesModel);

module.exports = clientes;