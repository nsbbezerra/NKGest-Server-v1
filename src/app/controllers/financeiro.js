const express = require('express');
const router = express.Router();
const ContasBancarias = require('../models/contasBancarias');
const FormasDePagamento = require('../models/formaPagamento');
const PlanoDeContas = require('../models/planoDeContas');
const ControleDeCheque = require('../models/cheques');
const Clientes = require('../models/clientes');
const ContasPagar = require('../models/contasPagar');
const ContasReceber = require('../models/contasReceber');
const dateFns = require('date-fns');
const DateNow = new Date();
const dayDate = DateNow.getDate();
const monthDate = DateNow.getMonth() + 1;
const yearDate = DateNow.getFullYear();
const meses = new Array('Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro');

//Rota para cadastrar Contas Bancárias
router.post('/saveContasBancarias', async (req, res) => {

    const { conta, saldo } = req.body;

    const contaBank = await ContasBancarias.findOne({ bank: conta });

    const findCaixa = await ContasBancarias.findOne({ bank: 'Caixa Movimento' });

    if(!findCaixa) {
        await ContasBancarias.create({
            bank: 'Caixa Movimento',
            value: 0
        });
    }

    if(contaBank){
        return res.status(400).send({ message: 'Esta conta bancária já está cadastrada' });
    }

    try {
        
        await ContasBancarias.create({

            bank: conta,
            value: saldo

        });

        return res.status(200).send({ message: 'Cadastrado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao cadastrar conta bancária' });
    }

});

//Rota para editar a conta bancária
router.put('/editConta/:id', async (req, res) => {
   
    const { id } = req.params;
    const { conta, saldo } = req.body;
    
    try {
        
        await ContasBancarias.findByIdAndUpdate(id,{
           
            $set: {
                bank: conta,
                value: saldo
            }
            
        });
        
        return res.status(200).send({ message: 'Alterado com sucesso' });
        
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao cadastrar conta bancária' });
    }
    
});

//Rota para cadastrar plano de contas
router.post('/savePlanoContas', async (req, res) => {

    const { plano, tipo } = req.body;

    const planodeconta = await PlanoDeContas.findOne({ planoConta: plano, typeMoviment: tipo });

    const servico = await PlanoDeContas.findOne({ planoConta: 'Prestação de Serviço' });

    const produto = await PlanoDeContas.findOne({ planoConta: 'Venda de Produtos' });

    if(!servico) {
        await PlanoDeContas.create({
            planoConta: 'Prestação de Serviço',
            typeMoviment: 'credit',
        });
    }

    if(!produto) {
        await PlanoDeContas.create({
            planoConta: 'Venda de Produtos',
            typeMoviment: 'credit',
        });
    }

    if(planodeconta){
        return res.status(400).send({ message: 'Este plano de contas já está cadastrado' });
    }

    try {
        
        await PlanoDeContas.create({

            planoConta: plano,
            typeMoviment: tipo,

        });

        return res.status(200).send({ message: 'Cadastrado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao cadastrar plano de contas' });
    }

});

//Rota para editar o plano de contas
router.put('/editPlanoConta/:id', async (req, res) => {
   
    const { id } = req.params;
    const { plano, tipo } = req.body;
    
    try {
        
        await PlanoDeContas.findByIdAndUpdate(id,{
            $set: {
                planoConta: plano,
                typeMoviment: tipo
            }
        });
        
        return res.status(200).send({ message: 'Alterado com sucesso' }); 
        
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar plano de contas' });
    }
    
});

//Rota para deletar plano de contas
router.delete('/delPlanoContas/:id', async (req, res) => {
    
    const { id } = req.params;
    
    try {
    
        await PlanoDeContas.findByIdAndDelete(id);
        
        return res.status(200).send({ message: 'Excluido com sucesso' });
        
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao excluir plano de contas' });
    }
    
});

//Rota para cadastrar os cheques
router.post('/saveCheque', async (req, res) => {

    const { client, number, entity, situation, value, emitDate, vencimento, obs, type } = req.body;

    const findCheque = await ControleDeCheque.findOne({ number: number });

    if(findCheque){
        return res.status(400).send({ message: 'Este cheque já está cadastrado' });
    }

    try {
        
        await ControleDeCheque.create({

            client, number, entity, situation, value, emitDate, vencimento, obs, type

        });

        return res.status(200).send({ message: 'Cadastrado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao cadastrar cheque' });
    }

});

//Rota para alterar o cheque
router.put('/editCheques/:id', async (req, res) => {
   
    const { id } = req.params;
    const { client, number, entity, situation, value, emitDate, vencimento, obs, type } = req.body;
    
    try {
        
        await ControleDeCheque.findByIdAndUpdate(id,{
            $set: {
                client, number, entity, situation, value, emitDate, vencimento, obs, type
            }
        });
        
        return res.status(200).send({ message: 'Alterado com sucesso' }); 
        
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar o cheque' });
    }
    
});

//Rota para excluir o cheque
router.delete('/delCheques/:id', async (req, res) => {
    
    const { id } = req.params;
    
    try {
    
        await ControleDeCheque.findByIdAndDelete(id);
        
        return res.status(200).send({ message: 'Excluido com sucesso' });
        
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao excluir cheque' });
    }
    
});

//Rota para alterar compensação do cheque
router.put('/editChequeSituation/:id', async (req, res) => {
   
    const { id } = req.params;
    const { situation } = req.body;
    
    try {
        
        await ControleDeCheque.findByIdAndUpdate(id,{
            $set: {
                situation
            }
        });
        
        return res.status(200).send({ message: 'Alterado com sucesso' }); 
        
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar o cheque' });
    }
    
});

//Rota para cadastrar formas de pagamento
router.post('/saveFormaPagamento', async (req, res) => {

    const { name, accountBank, maxParcela, intervalDays, statusPay, boleto, firtsPay, cheque, accData, credito } = req.body;

    const formapagamento = await FormasDePagamento.findOne({ name: name });

    if(formapagamento){
        return res.status(400).send({ message: 'Esta forma de pagamento já está cadastrada' });
    }

    try {
        
        await FormasDePagamento.create({
        
            name, accountBank, maxParcela, intervalDays, statusPay, boleto, firtsPay, cheque, accData, credito

        });

        return res.status(200).send({ message: 'Cadastrado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao cadastrar a forma de pagamento' });
    }

});

//Rota para listar as formas de pagamento
router.get('/findFormaPagamento', async (req, res) => {

    try {
        
        const formaPagamento =  await FormasDePagamento.find().sort({ name: 1 }).populate({ path: 'accountBank', select: 'bank' });

        return res.status(200).send({ formaPagamento });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para editar forma de pagamento
router.put('/editFormaPagamento/:id', async (req, res) => {
   
    const { id } = req.params;
    const { name, accountBank, maxParcela, intervalDays, statusPay, boleto, firtsPay, cheque, credito } = req.body;
    
    try {
        
        await FormasDePagamento.findByIdAndUpdate(id, {
           
            name, accountBank, maxParcela, intervalDays, statusPay, boleto, firtsPay, cheque, credito
            
        });
        
        return res.status(200).send({ message: 'Aterado com sucesso' });
        
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar a forma de pagamento' });
    }
    
});

//Rota para deletar forma de pagamento
router.delete('/delFormaPagamento/:id', async (req, res) => {
    
    const { id } = req.params;
    
    try {
    
        await FormasDePagamento.findByIdAndDelete(id);
        
        return res.status(200).send({ message: 'Excluido com sucesso' });
        
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao excluir forma de pagamento' });
    }
    
});

//Rota para listar o mês ativo.
router.get('/findMesAtivo', async (req, res) => {

    try {
        
        const mesAtivo = await MesAtivo.findOne({ status: 'active' });

        return res.status(200).send({ mesAtivo });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para listar Clientes
router.get('/listClientes', async (req, res) => {

    try {
        
        const clientes = await Clientes.find().sort({ name: 1 });

        return res.status(200).send({ clientes });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para listar Contas Bancárias
router.get('/listContasBancarias', async (req, res) => {

    try {
        
        const contas = await ContasBancarias.find().sort({ bank: 1 });

        return res.status(200).send({ contas });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para listar o plano de contas
router.get('/findPlanoContas', async (req, res) => {

    try {
        
        const planoConta = await PlanoDeContas.find().sort({ planoConta: 1 }).populate({ path: 'contaMoviment', select: 'bank' });

        return res.status(200).send({ planoConta });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para listar os cheques
router.get('/findCheques', async (req, res) => {

    try {
        
        const cheques = await ControleDeCheque.find().populate({ path: 'client', select: 'name' });

        return res.status(200).send({ cheques });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para Cadastrar contas a pagar
router.post('/createContasPagar', async (req, res) => {

    const { planContas, payForm, accountBank, vencimento, value, statusPay, description } = req.body;
    const dataCadastro = dateFns.format(new Date(yearDate, monthDate - 1, dayDate), 'dd/MM/yyyy');
    const novaData = new Date(vencimento);
    const novoMes = novaData.getMonth();
    const novoAno = novaData.getFullYear();
    try {
        
        await ContasPagar.create({
            planContas, payForm, accountBank, vencimento, value, statusPay, createDate: dataCadastro, description, month: meses[novoMes], year: novoAno
        });

        return res.status(200).send({ message: 'Lançamento cadastrado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao cadastrar lançamento' });
    }

});

//Rota para alterar uma conta a pagar
router.put('/changeContasPagar/:id', async (req, res) => {

    const { id } = req.params;
    const { planContas, payForm, accountBank, vencimento, value, description } = req.body;
    const novaData = new Date(vencimento);
    const novoMes = novaData.getMonth();
    const novoAno = novaData.getFullYear();
    try {
        
        await ContasPagar.findByIdAndUpdate(id, {
            $set: {
                planContas, payForm, accountBank, vencimento, value, description, month: meses[novoMes], year: novoAno
            }
        });

        return res.status(200).send({ message: 'Alterado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar lançamento' });
    }

});

//Rota para alterar o status do pagamento
router.put('/changePaymentContasPagar/:id', async (req, res) => {

    const { id } = req.params;
    const { statusPay } = req.body;

    try {
        
        await ContasPagar.findByIdAndUpdate(id, { $set: { statusPay } });

        return res.status(200).send({ message: 'Alterado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar lançamento' });
    }

});

//Rota para excluir contas a pagar
router.delete('/delContasPagar/:id', async (req, res) => {

    const { id } = req.params;

    try {
        
        await ContasPagar.findByIdAndDelete(id);

        return res.status(200).send({ message: 'Excluído com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao excluir lançamento' });
    }

});

//Busca contas a pagar
router.post('/findContasPagar', async (req, res) => {

    const { typeSearch, data, mes, ano } = req.body;
    const mesFind = meses[monthDate - 1];

    try {
        
        if(typeSearch === 1) {
            const contasPagar = await ContasPagar.find({ month: mesFind, year: yearDate }).populate({ path: 'planContas payForm accountBank', select: 'planoConta name bank' }).sort({ dateSave: 1 });

            return res.status(200).send({ contasPagar });
        }

        if(typeSearch === 2) {
            const contasPagar = await ContasPagar.find({ createDate: data }).populate({ path: 'planContas payForm accountBank', select: 'planoConta name bank' }).sort({ dateSave: 1 });

            return res.status(200).send({ contasPagar });
        }

        if(typeSearch === 3) {
            const contasPagar = await ContasPagar.find({ month: mes, year: ano }).populate({ path: 'planContas payForm accountBank', select: 'planoConta name bank' }).sort({ dateSave: 1 });

            return res.status(200).send({ contasPagar });
        }

        if(typeSearch === 4) {
            const contasPagar = await ContasPagar.find({ year: ano }).populate({ path: 'planContas payForm accountBank', select: 'planoConta name bank' }).sort({ dateSave: 1 });

            return res.status(200).send({ contasPagar });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar lançamentos' });
    }

});

//Rota para Cadastrar contas a receber
router.post('/createContasReceber', async (req, res) => {

    const { planContas, payForm, accountBank, vencimento, value, statusPay, description } = req.body;
    const dataCadastro = dateFns.format(new Date(yearDate, monthDate - 1 , dayDate), 'dd/MM/yyyy');
    const novaData = new Date(vencimento);
    const novoMes = novaData.getMonth();
    const novoAno = novaData.getFullYear();
    try {
        
        await ContasReceber.create({
            planContas, payForm, accountBank, vencimento, value, statusPay, createDate: dataCadastro, description, month: meses[novoMes], year: novoAno
        });

        return res.status(200).send({ message: 'Lançamento cadastrado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao cadastrar lançamento' });
    }

});

//Rota para alterar uma conta a receber
router.put('/changeContasReceber/:id', async (req, res) => {

    const { id } = req.params;
    const { planContas, payForm, accountBank, vencimento, value, description } = req.body;
    const novaData = new Date(vencimento);
    const novoMes = novaData.getMonth();
    const novoAno = novaData.getFullYear();
    try {
        
        await ContasReceber.findByIdAndUpdate(id, {
            $set: {
                planContas, payForm, accountBank, vencimento, value, description, month: meses[novoMes], year: novoAno
            }
        });

        return res.status(200).send({ message: 'Alterado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar lançamento' });
    }

});

//Rota para alterar o status do pagamento contas receber
router.put('/changePaymentContasReceber/:id', async (req, res) => {

    const { id } = req.params;
    const { statusPay } = req.body;

    try {
        
        await ContasReceber.findByIdAndUpdate(id, { $set: { statusPay } });

        return res.status(200).send({ message: 'Alterado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao alterar lançamento' });
    }

});

//Rota para excluir contas a receber
router.delete('/delContasReceber/:id', async (req, res) => {

    const { id } = req.params;

    try {
        
        await ContasReceber.findByIdAndDelete(id);

        return res.status(200).send({ message: 'Excluído com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao excluir lançamento' });
    }

});

//Busca contas a pagar
router.post('/findContasReceber', async (req, res) => {

    const { typeSearch, data, mes, ano } = req.body;
    const mesFind = meses[monthDate - 1];
    
    try {
        
        if(typeSearch === 1) {
            const contasReceber = await ContasReceber.find({ month: mesFind, year: yearDate }).populate({ path: 'planContas payForm accountBank', select: 'planoConta name bank' }).sort({ dateSave: 1 });

            return res.status(200).send({ contasReceber });
        }

        if(typeSearch === 2) {
            const contasReceber = await ContasReceber.find({ createDate: data }).populate({ path: 'planContas payForm accountBank', select: 'planoConta name bank' }).sort({ dateSave: 1 });

            return res.status(200).send({ contasReceber });
        }

        if(typeSearch === 3) {
            const contasReceber = await ContasReceber.find({ month: mes, year: ano }).populate({ path: 'planContas payForm accountBank', select: 'planoConta name bank' }).sort({ dateSave: 1 });

            return res.status(200).send({ contasReceber });
        }

        if(typeSearch === 4) {
            const contasReceber = await ContasReceber.find({ year: ano }).populate({ path: 'planContas payForm accountBank', select: 'planoConta name bank' }).sort({ dateSave: 1 });

            return res.status(200).send({ contasReceber });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar lançamentos' });
    }

});

//Rota para as buscas de recebimento
router.get('/findersReceive', async (req, res) => {
    try {
        const formaPagamento =  await FormasDePagamento.find().sort({ name: 1 }).populate({ path: 'accountBank', select: 'bank' });
        const contas = await ContasBancarias.find().sort({ bank: 1 });
        const planoConta = await PlanoDeContas.find({ typeMoviment: 'credit' }).sort({ planoConta: 1 }).populate({ path: 'contaMoviment', select: 'bank' });
        
        return res.status(200).send({ formaPagamento, contas, planoConta });
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar' });
    }
});

//Rota para as buscas de pagamento
router.get('/findersPayment', async (req, res) => {
    try {
        const formaPagamento =  await FormasDePagamento.find().sort({ name: 1 }).populate({ path: 'accountBank', select: 'bank' });
        const contas = await ContasBancarias.find().sort({ bank: 1 });
        const planoConta = await PlanoDeContas.find({ typeMoviment: 'debit' }).sort({ planoConta: 1 }).populate({ path: 'contaMoviment', select: 'bank' });
        
        return res.status(200).send({ formaPagamento, contas, planoConta });
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar' });
    }
});

module.exports = app => app.use('/financial', router);
