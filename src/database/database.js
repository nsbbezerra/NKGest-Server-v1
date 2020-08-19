const mongoose = require('mongoose');

const connect = "mongodb://localhost:27017/torneadora";

mongoose.connect(connect, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;