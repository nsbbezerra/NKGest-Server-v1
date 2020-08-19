const express = require('express');
const router = express.Router();
const Caixa = require('../models/caixaDiario');
const Movimentacao = require('../models/movimentacaoCaixa');
const Funcionario = require('../models/funcionarios');
const Venda = require('../models/ordens');
const Servicos = require('../models/ordenServico');
const dateFns = require('date-fns');
const DateNow = new Date();
const dayDate = DateNow.getDate();
const monthDate = DateNow.getMonth() + 1;
const yearDate = DateNow.getFullYear();
const meses = new Array('Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro');

//Rota para abrir o caixa
router.post('/open', async (req, res) => {

    const { funcionario, valueOpened } = req.body;

    const dataCadastro = dateFns.format(new Date(yearDate, monthDate - 1 ,dayDate), 'dd/MM/yyyy');

    const findFuncionario = await Funcionario.findOne({ _id: funcionario });

    if (findFuncionario.caixa !== true && findFuncionario.admin !== true) {
        return res.status(400).send({ message: 'Funcionário sem autorização para efetuar esta ação' });
    }

    try {

        await Caixa.create({
            funcionario, valueOpened, saldo: valueOpened, valueClosed: 0, movimentDate: dataCadastro, status: 'open', month: meses[monthDate - 1], year: yearDate
        });

        return res.status(200).send({ message: 'Caixa aberto com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao abrir o caixa' });
    }

});

//Rota para efetuar um depósito
router.put('/deposit/:id', async (req, res) => {

    const { id } = req.params;
    const { deposit, description } = req.body;

    const dataCadastro = dateFns.format(new Date(yearDate, monthDate - 1 ,dayDate), 'dd/MM/yyyy');

    const findCaixa = await Caixa.findOne({ _id: id }).select('saldo');

    const actualValue = findCaixa.saldo;

    const newValue = actualValue + parseInt(deposit);

    try {

        await Caixa.findByIdAndUpdate(id, {
            $set: {
                saldo: newValue
            }
        });

        await Movimentacao.create({
            idCaixa: id, typeMoviment: 'credit', value: deposit, description, createDate: dataCadastro, month: meses[monthDate - 1], year: yearDate
        });

        return res.status(200).send({ message: 'Depósito efetuado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao efetuar depósito' });
    }

});

//Rota para efetuar uma retirada do caixa
router.put('/withdraw/:id', async (req, res) => {

    const { id } = req.params;
    const { withdraw, description } = req.body;

    const findCaixa = await Caixa.findOne({ _id: id }).select('saldo');

    const dataCadastro = dateFns.format(new Date(yearDate, monthDate - 1 ,dayDate), 'dd/MM/yyyy');

    const actualValue = findCaixa.saldo;

    const newValue = actualValue - parseInt(withdraw);


    try {

        await Caixa.findByIdAndUpdate(id, {
            $set: {
                saldo: newValue
            }
        });

        await Movimentacao.create({
            idCaixa: id, typeMoviment: 'debit', value: withdraw, description, createDate: dataCadastro, month: monthDate - 1, year: yearDate
        });

        return res.status(200).send({ message: 'Retirada efetuada com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao efetuar a retirada' });
    }

});

//Rota para excluir uma movimentação do caixa
router.delete('/delMoviment/:id', async (req, res) => {

    const { id } = req.params;

    const findPerCaixa = await Movimentacao.findOne({ _id: id }).select('idCaixa typeMoviment value');

    const findCaixa = await Caixa.findOne({ _id: findPerCaixa.idCaixa }).select('saldo');

    const saldoCaixa = findCaixa.saldo;

    const valorMovimento = findPerCaixa.value;

    try {

        if(findPerCaixa.typeMoviment === 'debit') {

            await Caixa.findByIdAndUpdate(findCaixa._id, {
                $set: {
                    saldo: saldoCaixa + valorMovimento
                }
            });

            await Movimentacao.findByIdAndDelete(id);

            return res.status(200).send({ message: 'Excluído com sucesso' });

        }

        if(findPerCaixa.typeMoviment === 'credit') {

            await Caixa.findByIdAndUpdate(findCaixa._id, {
                $set: {
                    saldo: saldoCaixa - valorMovimento
                }
            });

            await Movimentacao.findByIdAndDelete(id);

            return res.status(200).send({ message: 'Excluído com sucesso' });

        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao excluir movimentação' });
    }

});

//Rota para fechar o caixa
router.put('/close/:id', async (req, res) => {

    const { id } = req.params;

    try {
        
        const findValueOpened = await Caixa.findOne({ _id: id }).select('valueOpened');
        const findCredits = await Movimentacao.find({ idCaixa: id, typeMoviment: 'credit' }).select('value');
        const findDebits = await Movimentacao.find({ idCaixa: id, typeMoviment: 'debit' }).select('value');
        
        const valueOpenedAct = findValueOpened.valueOpened;

        var valuesCredits = findCredits.filter((valor) => {
            return valor.value;
        });

        var calcCredits = valuesCredits.reduce((sum, valor) => {
            return sum + valor.value;
        }, 0);

        var valuesDebits = findDebits.filter((valor) => {
            return valor.value;
        });

        var calcDebits = valuesDebits.reduce((sum, valor) => {
            return sum + valor.value;
        }, 0);

        const result = calcCredits - calcDebits;
        
        const valueFechamento = valueOpenedAct + result;

        await Caixa.findByIdAndUpdate(id, {
            $set: {
                status: 'close',
                valueClosed: valueOpenedAct + result
            }
        });

        return res.status(200).send({ valueOpenedAct, calcCredits, calcDebits, valueFechamento });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao fechar o caixa' });
    }

});

//Buscar Movimentação do caixa
router.post('/findMoviment/:id', async (req, res) => {

    const { id } = req.params;

    try {

        const findCaixa = await Caixa.findOne({ _id: id }).populate({ path: 'funcionario', select: 'name' });
        const findMoviments = await Movimentacao.find({ idCaixa: id });

        return res.status(200).send({ findCaixa, findMoviments });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar informações sobre o caixa' });
    }

});

//Buscar caixa por id
router.post('/findCaixaPerId/:id', async (req, res) => {

    const { id } = req.params;

    try {

        const findCaixa = await Caixa.findOne({ _id: id }).populate({ path: 'funcionario', select: 'name' });

        return res.status(200).send({ findCaixa });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar informações sobre o caixa' });
    }

});

//Autenticar o funcionário do caixa
router.post('/authenticate/:id', async (req, res) => {

    const { id } = req.params;
    const { user, password } = req.body;
    
    const funcionario = await Funcionario.findOne({ _id: id }).select('user password');
    
    if (user !== funcionario.user) {
        return res.status(400).send({ message: 'Usuário não encontrado' });
    }
    if (password !== funcionario.password) {
        return res.status(400).send({ message: 'Senha inválida' });
    }

    return res.status(200).send({ message: 'OK' });
});

//Rota para listar caixas abertos
router.get('/listOpen', async (req, res) => {

    try {

        const caixas = await Caixa.find({ status: 'open' }).populate({ path: 'funcionario', select: 'name' }).sort({ $natural: -1 });

        return res.status(200).send({ caixas });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar caixas' });
    }

});

//Rota para listar caixas fechados
router.get('/listClose', async (req, res) => {

    try {

        const caixas = await Caixa.find({ status: 'close' }).populate({ path: 'funcionario', select: 'name' }).sort({ $natural: -1 });

        return res.status(200).send({ caixas });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar caixas' });
    }

});

//Rota para buscar funcionários caixa
router.get('/findFuncCaixas', async (req, res) => {
   
    try {
        
        const funcionarios = await Funcionario.find({ caixa: true }).select('name');
        
        return res.status(200).send({ funcionarios });
        
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar funcionários' });
    }
    
});

//Rota para busca Avançara
router.post('/advancedFind', async (req, res) => {
   
    const { func, type, dia, mes, ano } = req.body;
    
    const dataForFind = `${dia}/${mes}/${ano}`;
    
    try {
        
        if(type === 1) {
            
            if(func === null) {
                
                const caixa = await Caixa.find({ movimentDate: dataForFind, status: 'close' }).populate({ path: 'funcionario', select: 'name' });
                
                return res.status(200).send({ caixa });
            }
            
            const caixa = await Caixa.find({ movimentDate: dataForFind, funcionario: func, status: 'close' }).populate({ path: 'funcionario', select: 'name' });
            
            return res.status(200).send({ caixa });
            
        }
        
        if(type === 2) {
            
            if(func === null) {
                
                const caixa = await Caixa.find({ month: mes, year: ano, status: 'close' }).populate({ path: 'funcionario', select: 'name' });
                
                return res.status(200).send({ caixa });
            }
            
            const caixa = await Caixa.find({ month: mes, year: ano, funcionario: func, status: 'close' }).populate({ path: 'funcionario', select: 'name' });
            
            return res.status(200).send({ caixa });
            
        }
        
        if(type === 3) {
            
            const caixa = await Caixa.find({ status: 'close' }).populate({ path: 'funcionario', select: 'name' });
            
            return res.status(200).send({ caixa });
            
        }
        
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }
    
});

//Rota para encerrar uma venda
router.put('/closeSale/:id', async (req, res) => {

    const { id } = req.params;
    const { caixa } = req.body;
    
    try {
        
        await Venda.findByIdAndUpdate(id, { $set: { finish: 'yes', caixa: caixa } });

        return res.status(200).send({ message: 'Venda encerrada com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao encerrar a venda' });
    }

});

//Rota para encerrar uma ordem de serviço
router.put('/closeService/:id', async (req, res) => {

    const { id } = req.params;
    const { caixa } = req.body;
    
    try {
        
        await Servicos.findByIdAndUpdate(id, { $set: { finish: 'yes', caixa: caixa } });

        return res.status(200).send({ message: 'Ordem de serviço encerrada com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao encerrar a ordem de serviço' });
    }

});

//Rota para listar as vendas e Ordens de Serviço
router.get('/listSales', async (req, res) => {
    try {
        const sales = await Venda.find({ statuSales: 'sale', waiting: 'none', finish: 'no' }).populate({ path: 'client funcionario address', select: 'name street number bairro city state' });
        const services = await Servicos.find({ statuSales: 'sale', waiting: 'none', finish: 'no' }).populate({ path: 'client funcionario veicles address', select: 'name model street number bairro city state' });
        
        return res.status(200).send({ sales, services });
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }
});

//Rota para buscar as ordens e vendas do caixa
router.get('/findCashierOrders/:id', async (req, res) => {

    const { id } = req.params;

    try {
        
        const vendas = await Venda.find({ statuSales: 'sale', finish: 'yes', waiting: 'none', caixa: id }).populate({ path: 'client funcionario', select: 'name' }).sort({ dateSave: 1 });

        const servicos = await Servicos.find({ statuSales: 'sale', finish: 'yes', waiting: 'none', caixa: id }).populate({ path: 'client funcionario mecanico veicles', select: 'name model' }).sort({ dateSave: 1 });

        return res.status(200).send({ vendas, servicos });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar informações' });
    }

});

module.exports = app => app.use('/cashier', router);
