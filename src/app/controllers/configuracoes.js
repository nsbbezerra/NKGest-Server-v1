const express = require('express');
const router = express.Router();
const Empresa = require('../models/dadosEmpresa');
const ConfigsGlobal = require('../models/configs');
const multer = require('multer');
const logo_config = require('../../configs/logoConfig');
const upload = multer(logo_config);
const fs = require('fs');
const path = require('path');

//Cadastrar os dados da empresa
router.post('/create', upload.single('logo'), async (req, res) => {

    const { filename } = req.file;

    const { name, cnpj, email, socialName, stateRegistration, municipalRegistration, phoneComercial, celOne, celTwo, serviceEmail, passwordEmail, taxRegime, street, number, comp, bairro, cep, city, state, ibgeCode } = req.body;

    try {

        const empresa = await Empresa.create({
            logo: filename,
            name: name,
            cnpj: cnpj,
            email: email,
            socialName: socialName,
            stateRegistration: stateRegistration,
            municipalRegistration: municipalRegistration,
            phoneComercial: phoneComercial,
            celOne: celOne,
            celTwo: celTwo,
            passwordEmail: passwordEmail,
            serviceEmail: serviceEmail,
            taxRegime, street, number, comp, bairro, cep, city, state, ibgeCode
        });

        return res.status(200).send({ empresa });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao salvar os dados' });
    }

});

//Buscar os dados da Empresa
router.get('/find', async (req, res) => {

    try {

        const empresa = await Empresa.findOne();

        return res.status(200).send({ empresa });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar os dados da empresa' });
    }

});

//Rota para editar os dados da empresa
router.put('/edit/:id', async (req, res) => {

    const { id } = req.params;
    const { name, cnpj, email, socialName, stateRegistration, municipalRegistration, phoneComercial, celOne, celTwo, taxRegime, street, number, comp, bairro, cep, city, state, ibgeCode } = req.body;

    try {

        await Empresa.findByIdAndUpdate(id, {
            $set: {

                name: name,
                cnpj: cnpj,
                email: email,
                socialName: socialName,
                stateRegistration: stateRegistration,
                municipalRegistration: municipalRegistration,
                phoneComercial: phoneComercial,
                celOne: celOne,
                celTwo: celTwo,
                taxRegime, street, number, comp, bairro, cep, city, state, ibgeCode
                
            }
        });

        return res.status(200).send({ message: 'Atualizado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao atualizar os dados' });
    }

});

//Alterar a Logo
router.post('/changeLogo', upload.single('logo'), async (req, res) => {

    const { id } = req.body;
    const { filename } = req.file;

    const empresa = await Empresa.findOne({ _id: id });

    try {
        
        const pathToFile = await path.resolve(__dirname, '..', '..', '..', 'uploads',`${empresa.logo}`);

        await fs.unlink(pathToFile, function (err) {
            if (err) return console.log(err);
            console.log('file deleted successfully');
        });

        await Empresa.findByIdAndUpdate(id, { $set: { logo: filename } });

        return res.status(200).send({ message: 'Logo alterada com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar a logo' });
    }

});

//Rota para Configurações globais
router.post('/configsGlobal', async (req, res) => {

    const { icms } = req.body;

    try {
        
        const configs = await ConfigsGlobal.find();

        if(!configs.length) {
            const conf = await ConfigsGlobal.create({ icms: icms });
            return res.status(200).send({ conf });
        } else {
            const conf = await ConfigsGlobal.findOneAndUpdate({ _id: configs[0]._id }, { $set: { icms: icms } }, { new: true });
            return res.status(200).send({ conf });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao salvar configurações' });
    }

});

//Rota para buscar as configurações globais
router.get('/findConfigsGlobal', async (req, res) => {
    try {
        const configs = await ConfigsGlobal.find();
        const conf = configs[0];
        return res.status(200).send({ conf });
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar as configurações globais' });
    }
});

module.exports = app => app.use('/organization', router);
