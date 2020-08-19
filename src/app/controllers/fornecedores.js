const express = require('express');
const router = express.Router();
const Fornecedor = require('../models/fornecedores');

//Listar todos os fornecedores
router.get('/list', async (req, res) => {
    try {
        const fornecedor = await Fornecedor.find();
        return res.status(200).send({ fornecedor });
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao listar os fornecedores' });
    }
});

//Alterar o fornecedor
router.put('/change/:id', async (req, res) => {
    const { id } = req.params;
    const { name, cpf_cnpj, email, phoneComercial, city, state } = req.body;
    try {
        await Fornecedor.findByIdAndUpdate(id, { $set: { name, cpf_cnpj, email, phoneComercial, city, state } });
        return res.status(200).send({ message: 'Fornecedor alterado com sucesso' });
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar o fornecedor' });
    }
});

module.exports = app => app.use('/fornecedores', router);