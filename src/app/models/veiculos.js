const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const VeiculoSchema = new Schema({ 

    client: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes', 
        required: true
    },
    model: {
        type: String,
        required: true
    },
    marca: {
        type: String,
        required: true
    },
    placa: {
        type: String,
        required: true
    },
    color: {
        type: String
    },
    fuel: {
        type: String
    },
    obs: {
        type: String
    }

});

const veiculos = mongoose.model('Veiculos', VeiculoSchema);

module.exports = veiculos;