const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const ContasBancariaSchema = new Schema({

    bank: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    }

});

const contasBancarias = mongoose.model('ContasBancarias', ContasBancariaSchema);

module.exports = contasBancarias;