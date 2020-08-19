const mongoose = require('../../database/database');
const Schema = mongoose.Schema;

const NFESchema = new Schema({
    sale: {
        type: mongoose.Types.ObjectId,
        ref: 'Ordens'
    },
    natureza_operacao: String,
    data_emissao: String,
    data_entrada_saida: String,
    tipo_documento: String,
    finalidade_emissao: String,
    cnpj_emitente: String,
    cpf_emitente: String,
    nome_emitente: String,
    nome_fantasia_emitente: String,
    logradouro_emitente: String,
    numero_emitente: String,
    bairro_emitente: String,
    municipio_emitente: String,
    uf_emitente: String,
    cep_emitente: String,
    inscricao_estadual_emitente: String,
    nome_destinatario: String,
    cpf_destinatario: String,
    cnpj_destinatario: String,
    inscricao_estadual_destinatario: String,
    telefone_destinatario: String,
    logradouro_destinatario: String,
    numero_destinatario: String,
    bairro_destinatario: String,
    municipio_destinatario: String,
    uf_destinatario: String,
    pais_destinatario: String,
    cep_destinatario: String,
    valor_frete: Number,
    modalidade_frete: Number,
    items: [
      {
        numero_item: Number,
        codigo_produto: String,
        codigo_barras_comercial: String,
        descricao: String,
        cfop: String,
        cest: String,
        unidade_comercial: String,
        quantidade_comercial: Number,
        valor_unitario_comercial: Number,
        valor_unitario_tributavel: Number,
        unidade_tributavel: String,
        codigo_ncm: String,
        quantidade_tributavel: Number,
        valor_bruto: Number,
        icms_situacao_tributaria: String,
        icms_origem: String,
        pis_situacao_tributaria: String,
        cofins_situacao_tributaria: String,
        valor_desconto: Number,
        
        icms_aliquota: Number,
        icms_modalidade_base_calculo_st: String,
        icms_margem_valor_adicionado_st: Number,
        icms_aliquota_st: Number,
        fcp_percentual: Number,
        fcp_percentual_st: Number,
        fcp_percentual_retido_st: Number,
        ipi_situacao_tributaria: String,
        ipi_aliquota: Number,
        ipi_codigo_enquadramento_legal: String,

        pis_aliquota_porcentual: Number,
        cofins_aliquota_porcentual: Number
      }
    ],
    informacoes_adicionais_contribuinte: String,
    notas_referenciadas: [{
      chave_nfe: String,
    }]
});

const nfeSchema = mongoose.model('NFESchema', NFESchema);

module.exports = nfeSchema;