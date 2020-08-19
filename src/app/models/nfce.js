const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const NFCESchema = new Schema({

    sale: {
        type: mongoose.Types.ObjectId,
        ref: 'Ordens'
    },
    natureza_operacao: String,
    data_emissao: String,
    tipo_documento: String,
    presenca_comprador: String,
    consumidor_final: String,
    finalidade_emissao: String,
    cnpj_emitente: String,
    cnpj_destinatario: String,
    nome_destinatario: String,
    cpf_destinatario: String,
    valor_produtos: String,
    valor_desconto: String,
    valor_total: String,
    forma_pagamento: String,
    modalidade_frete: String,
    items: [
        {
            numero_item: String,
            codigo_ncm: String,
            quantidade_comercial: String,
            quantidade_tributavel: String,
            cfop: String,
            valor_unitario_tributavel: String,
            valor_unitario_comercial: String,
            valor_desconto: String,
            descricao: String,
            codigo_produto: String,
            icms_origem: String,
            icms_situacao_tributaria: String,
            unidade_comercial: String,
            unidade_tributavel: String,
        }
    ],
    formas_pagamento: [
        {
            forma_pagamento: String,
            valor_pagamento: String,
        }
    ]

});

const nfceSchema = mongoose.model('NFCESchema', NFCESchema);

module.exports = nfceSchema;