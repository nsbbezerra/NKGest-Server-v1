const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const EnderecoSchema = new Schema({

    client: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true,
        unique: true
    },
    street: {
        type: String,
        required: true
    },
    number: {
        type: String,
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
    obs: {
        type: String
    }

});

const enderecos = mongoose.model('Enderecos', EnderecoSchema);

module.exports = enderecos;