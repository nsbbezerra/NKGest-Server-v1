const mongoose = require('../../database/database');
const Schema = mongoose.Schema;
const logourl = require('../../configs/logoUrl.json');

const DadosEmpresaSchema = new Schema({

    name: {
        type: String,
        required: true,
    },
    cnae: {
        type: String,
    },
    cnpj: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    serviceEmail: {
        type: String,
        required: true
    },
    passwordEmail: {
        type: String,
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
    phoneComercial: {
        type: String
    },
    celOne: {
        type: String
    },
    celTwo: {
        type: String
    },
    taxRegime: {
        type: String, //Simples Naciona, MEI, Lucro Presumido, Lucro Real, Isento
        required: true
    },
    street: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    comp: {
        type: String
    },
    bairro: {
        type: String,
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
    ibgeCode: {
        type: String,
        required: true
    },
    idEmpresa: {
        type: String,
    },
    logo: String
},{
    toJSON: {
        virtuals: true
    }
});

DadosEmpresaSchema.virtual('logo_url').get(function() {
    return `${logourl.logoUrl}/img/${this.logo}`;
});

const dadosEmpresa = mongoose.model('DadosEmpresa', DadosEmpresaSchema);

module.exports = dadosEmpresa;
