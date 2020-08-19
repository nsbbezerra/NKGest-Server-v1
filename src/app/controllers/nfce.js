const express = require('express');
const router = express.Router();
const Vendas = require('../models/ordens');
const Produtos = require('../models/produtos');
const Empresa = require('../models/dadosEmpresa');
const Clientes = require('../models/clientes');
const NfeConfig = require('../../configs/nfeioConfig.json');
const dateFns = require('date-fns');
const NFCE = require('../models/nfce');

//Rota para gerar o rascunho da NFCE
router.post('/nfceRasc', async (req, res) => {

    const { cliente, venda, cfop, icms, config, frete, formaPagamento } = req.body;

    try {

        const products = await Produtos.find();
        const company = await Empresa.find();
        const client = await Clientes.findOne({ _id: cliente });
        const sale = await Vendas.findOne({ _id: venda });

        let documentClient = client.cpf_cnpj.normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, '');
        let documentCompany = company[0].cnpj.normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, '');

        if (client.typeClient === 'fisic') {
            await NFCE.create({
                sale: sale._id,
                natureza_operacao: 'VENDA AO CONSUMIDOR',
                data_emissao: dateFns.format(new Date(), 'yyyy-MM-dd'),
                tipo_documento: config.typeDocument,
                presenca_comprador: config.buyerPresence,
                consumidor_final: "1",
                finalidade_emissao: "1",
                cnpj_emitente: documentCompany,
                nome_destinatario: client.name,
                cpf_destinatario: documentClient,
                valor_produtos: sale.valueBruto,
                valor_desconto: sale.desconto,
                valor_total: sale.valueLiquido,
                forma_pagamento: formaPagamento.type,
                modalidade_frete: frete.mode,
                formas_pagamento: formaPagamento
            });
        } else {
            await NFCE.create({
                sale: sale._id,
                natureza_operacao: 'VENDA AO CONSUMIDOR',
                data_emissao: dateFns.format(new Date(), 'yyyy-MM-dd'),
                tipo_documento: config.typeDocument,
                presenca_comprador: config.buyerPresence,
                consumidor_final: "1",
                finalidade_emissao: "1",
                cnpj_emitente: documentCompany,
                nome_destinatario: client.name,
                cnpj_destinatario: documentClient,
                valor_produtos: sale.valueBruto,
                valor_desconto: sale.desconto,
                valor_total: sale.valueLiquido,
                forma_pagamento: formaPagamento.type,
                modalidade_frete: frete.mode,
            });
        }

        const nfeRasc = await NFCE.findOne({ sale: sale._id });

        var numeroItem = 1;

        await sale.products.map(prod => {
            updateItems(prod, numeroItem);
            numeroItem++;
        });

        async function updateItems(prod, number) {
            let result = await products.find(obj => obj.name === prod.name);
            var cfpoNumber;
            var icmsCst;
            if (cfop.status === true) {
                cfpoNumber = cfop.value;
            } else {
                cfpoNumber = result.cfop;
            }
            if(icms.status === true) {
                icmsCst = icms.cst;
            } else {
                icmsCst = result.icms.csosn
            }
            let info = await {
                numero_item: number,
                codigo_ncm: result.ncm,
                quantidade_comercial: prod.quantity,
                quantidade_tributavel: prod.quantity,
                cfop: cfpoNumber,
                valor_unitario_tributavel: prod.valueUnit,
                valor_unitario_comercial: prod.valueUnit,
                valor_desconto: sale.desconto,
                descricao: "NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL",
                codigo_produto: result.code,
                icms_origem: result.icms.origin,
                icms_situacao_tributaria: icmsCst,
                unidade_comercial: result.unMedida,
                unidade_tributavel: result.unMedida
            }
            await NFCE.update({ _id: nfeRasc._id }, { $push: { items: info } });
        }

        await Vendas.findByIdAndUpdate(sale._id, { $set: { rascunhoNFCE: true } });

        let rascunhoId = nfeRasc._id;

        return res.status(200).send({ message: 'Rascunho gerado com sucesso', rascunhoId });

    } catch (error) {
        return res.status(400).send({ message: "Ocorreu um erro ao gerar o rascunho da NFCE" });
    }

});

//Rota para emitir NFCE
router.post('/nfceEmit', async (req, res) => {

    const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
    const request = new XMLHttpRequest();

    const { id } = req.body;

    try {

        const nfeRas = await NFCE.findOne({ sale: id });

        let urlNfe = `${NfeConfig.url}/v2/nfce?ref=${nfeRas.sale}`;

        await request.open('POST', urlNfe, false, NfeConfig.token);

        await request.send(JSON.stringify(nfeRas));

        const response = JSON.parse(request.responseText);

        const statusResponse = response.status;
        var info;
        let warning = response.codigo;

        if(warning === 'erro_validacao') {
            info = response.codigo;
            let message = response.mensagem;
            return res.status(200).send({ message, info });
        }

        if(warning === "already_processed") {
            info = response.codigo;
            let message = response.mensagem;
            return res.status(200).send({ message, info });
        }

        if(statusResponse === 'processando_autorizacao') {
            info = response.status;
            await Vendas.findByIdAndUpdate(nfeRas.sale, { $set: { nfeStatus: info } });
            return res.status(200).send({ message: 'Aguarde alguns instantes, a NFE está sendo processada pela SEFAZ', info });
        }
        if(statusResponse === 'erro_autorizacao') {
            info = response.status;
            await Vendas.findByIdAndUpdate(nfeRas.sale, { $set: { nfeStatus: info } });
            return res.status(200).send({ message: 'Houve um erro de autorização por parte da SEFAZ', info });
        }
        if(statusResponse === 'denegado') {
            info = response.status;
            await Vendas.findByIdAndUpdate(nfeRas.sale, { $set: { nfeStatus: info } });
            return res.status(200).send({ message: 'Houve uma inconsistência nos dados cadastrais, a NFE foi denegada pela SEFAZ', info });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

module.exports = app => app.use('/nfce', router);