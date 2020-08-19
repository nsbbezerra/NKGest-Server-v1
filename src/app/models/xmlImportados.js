const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const XmlImporterSchema = new Schema({
    idNfe: String,
    importerDate: String
});

const xmlimporter = mongoose.model('XmlImporter', XmlImporterSchema);

module.exports = xmlimporter;