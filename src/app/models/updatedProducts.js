const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const UpdatedSchema = new Schema({
    idNfe: String,
    importerDate: String
});

const updatedSchema = mongoose.model('UpdatedSchema', UpdatedSchema);

module.exports = updatedSchema;