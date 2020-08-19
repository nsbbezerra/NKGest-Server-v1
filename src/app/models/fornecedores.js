const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const FornecedoreSchema = new Schema({

    name: {
        type: String,
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
        type: String
    },
    typeClient: {
        type: String,
        enum: ['fisic', 'juridic']
    },
    socialName: {
        type: String
    },
    stateRegistration: {
        type: String
    },
    typeTaxPayer: {
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
    cep: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    munipalCode: {
        type: String
    },
    createDate: {
        type: String,
        require: true
    }

});

const fornecedores = mongoose.model('Fornecedores', FornecedoreSchema);

module.exports = fornecedores;