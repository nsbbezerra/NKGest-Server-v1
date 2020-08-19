const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const configsGlobalSchema = new Schema({
    icms: {
        interno: Number,
        externo: Number,
        importado: Number
    }
});

const configGlobal = mongoose.model('ConfigGlobal', configsGlobalSchema);

module.exports = configGlobal;