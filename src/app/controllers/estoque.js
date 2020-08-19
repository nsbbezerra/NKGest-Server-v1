const express = require('express');
const router = express.Router();
const Produtos = require('../models/produtos');
const Fornecedores = require('../models/fornecedores');
const Empresa = require('../models/dadosEmpresa');
const nodemailer = require('nodemailer');

//Rota para buscar os produtos
router.get('/findProdutos', async (req, res) => {

    try {

        const produtos = await Produtos.find().sort({ codiname: 1 }).populate({ path: 'fornecedor', select: 'name' });

        return res.status(200).send({ produtos });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para buscar os produtos com código de barras
router.get('/findProdutosByCode', async (req, res) => {

    try {

        const produtos = await Produtos.find().sort({ codiname: 1 }).populate({ path: 'fornecedor', select: 'name' });

        return res.status(200).send({ produtos });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para buscar os fornecedores
router.get('/findFornecedores', async (req, res) => {

    try {

        const fornecedores = await Fornecedores.find().sort({ name: 1 });

        return res.status(200).send({ fornecedores });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para ativar/desativar produtos
router.put('/active/:id', async (req, res) => {

    const { id } = req.params;
    const { active } = req.body;

    try {

        await Produtos.findByIdAndUpdate(id, {
            $set: {

                active: active

            }
        });

        return res.status(200).send({ message: 'Alterado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar o estado do produto' });
    }

});

//Rota para ajustar o estoque
router.put('/ajusteEstoque/:id', async (req, res) => {

    const { id } = req.params;
    const { estoqueAct } = req.body;

    try {

        await Produtos.findByIdAndUpdate(id, {

            $set: {
                estoqueAct: estoqueAct
            }

        });

        return res.status(200).send({ message: 'Alterado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar o estoque' });
    }

});

//Rota para alterar os preços
router.put('/ajustePrecos/:id', async (req, res) => {

    const { id } = req.params;
    const { custo, despesa, venda, icms, pis, cofins } = req.body;

    try {

        await Produtos.findByIdAndUpdate(id, {

            $set: {
                valueCusto: custo,
                valueDiversos: despesa,
                valueSale: venda,
                icms, pis, cofins
            }

        });

        return res.status(200).send({ message: 'Alterado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar os preços' });
    }

});

//Rota para alterar o fornecedor
router.put('/alterarFornece/:id', async (req, res) => {

    const { id } = req.params;
    const { fornecedor } = req.body;

    try {

        await Produtos.findByIdAndUpdate(id, {
            $set: {

                fornecedor: fornecedor

            }
        });

        return res.status(200).send({ message: 'Alterado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar o fornecedor' });
    }

});

//Rota para buscar os produtos com baixo estoque
router.get('/baixoEstoque', async (req, res) => {

    try {

        const produtos = await Produtos.find({ estoqueAct: { $lte: 5 } }).sort({ name: 1 }).populate({ path: 'fornecedor', select: 'name' });

        return res.status(200).send({ produtos });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para adicionar uma Compra
router.put('/sendSales/:id', async (req, res) => {

    const { id } = req.params;
    const { code, codeUniversal, valueCusto, valueDiversos, valueSale, estoqueAct, cfop, ncm, cest, icms, pis, cofins } = req.body;

    try {
        
        await Produtos.findByIdAndUpdate(id, {
            $set: {
                code, codeUniversal, valueCusto, valueDiversos, valueSale, estoqueAct, cfop, ncm, cest, icms, pis, cofins
            }
        });

        return res.status(200).send({ message: 'Alterado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao lançar a compra' });
    }

});

//Rota para enviar Pedido
router.post('/sendPedido', async (req, res) => {

    const { idFornecedor, menssagem } = req.body;

    const dadosEmpresa = await Empresa.findOne();
    const emailFornecedor = await Fornecedores.findOne({ _id: idFornecedor }).select('email');

    try {

        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "7ead186ac7d660",
                pass: "b63466cde1b8fb"
            }
        });

        await transport.sendMail({
            from: `${dadosEmpresa.email}`, // sender address
            to: `${emailFornecedor.email}`, // list of receivers
            subject: `Pedido de: ${dadosEmpresa.name}`, // Subject line
            text: "Hello world?", // plain text body
            html: `<b>${menssagem}</b>` // html body
        });

        return res.status(200).send({ message: 'Pedido enviado com sucesso, confirme com o fornecedor o recebimento do mesmo.' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao enviar o pedido' });
    }

});

module.exports = app => app.use('/stock', router);
