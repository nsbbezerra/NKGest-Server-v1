const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require('path');
const initConfig = require('./app/controllers/initController');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/xml',express.static(path.resolve(__dirname, 'src', 'public', 'xml')));
app.use('/img',express.static(path.resolve(__dirname, '..', 'uploads')));

require('./app/controllers/administrativo')(app);
require('./app/controllers/cadastros')(app);
require('./app/controllers/caixa')(app);
require('./app/controllers/estoque')(app);
require('./app/controllers/financeiro')(app);
require('./app/controllers/relatorios')(app);
require('./app/controllers/vendas')(app);
require('./app/controllers/configuracoes')(app);
require('./app/controllers/pagamentos')(app);
require('./app/controllers/comissoes')(app);
require('./app/controllers/balancete')(app);
require('./app/controllers/fornecedores')(app);
require('./app/controllers/nfe')(app);
require('./app/controllers/nfce')(app);
require('./app/controllers/xmlImporter')(app);

const PORT = 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST,function() {
    console.log('Servidor ativo na porta %s', PORT);
    initConfig.init();
})