const express = require('express');
const router = express.Router();
const Vendas = require('../models/ordens');
const OrdenServico = require('../models/ordenServico');
const PagamentoVendas = require('../models/pagamentosVendas');
const PagamentoServicos = require('../models/pagamentosServicos');
const Comissoes = require('../models/comissions');
const Funcionarios = require('../models/funcionarios');
const FormaPagamento = require('../models/formaPagamento');
const Clientes = require('../models/clientes');
const dateFns = require('date-fns');
const pagarme = require('pagarme');
const apiKey = require('../../configs/pagarmeConfig.json');
const DateNow = new Date();
const dayDate = DateNow.getDate();
const monthDate = DateNow.getMonth() + 1;
const yearDate = DateNow.getFullYear();
const meses = new Array('Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro');

//Rota para listar as vendas em aberto(busca, por cliente, data e vendedor)
router.post('/listSales', async (req, res) => {

    const { find, client, mes, ano } = req.body;

    try {

        //Buscar por Mês Atual
        if (find === 1) {
            const vendas = await Vendas.find({ statuSales: 'sale', statusPay: 'wait', finish: 'yes', waiting: 'none', month: meses[monthDate - 1], year: yearDate }).populate({ path: 'client funcionario', select: 'name' }).sort({ dateSave: 1 });

            const ordens = await OrdenServico.find({ statuSales: 'sale', statusPay: 'wait', finish: 'yes', waiting: 'none', month: meses[monthDate - 1], year: yearDate }).populate({ path: 'client funcionario mecanico veicles', select: 'name model' }).sort({ dateSave: 1 });

            return res.status(200).send({ vendas, ordens });
        }

        //Buscar por Período
        if (find === 2) {
            const vendas = await Vendas.find({ statuSales: 'sale', statusPay: 'wait', finish: 'yes', waiting: 'none', month: mes, year: ano }).populate({ path: 'client funcionario', select: 'name' }).sort({ dateSave: 1 });

            const ordens = await OrdenServico.find({ statuSales: 'sale', statusPay: 'wait', finish: 'yes', waiting: 'none', month: mes, year: ano }).populate({ path: 'client funcionario mecanico veicles', select: 'name model' }).sort({ dateSave: 1 });

            return res.status(200).send({ vendas, ordens });
        }

        //Buscar por Todas
        if (find === 3) {
            const vendas = await Vendas.find({ statuSales: 'sale', statusPay: 'wait', finish: 'yes', waiting: 'none' }).populate({ path: 'client funcionario', select: 'name' }).sort({ dateSave: 1 });

            const ordens = await OrdenServico.find({ statuSales: 'sale', statusPay: 'wait', finish: 'yes', waiting: 'none', month: mes, year: ano }).populate({ path: 'client funcionario mecanico veicles', select: 'name model' }).sort({ dateSave: 1 });

            return res.status(200).send({ vendas, ordens });
        }

        //Buscar por Cliente
        if (find === 4) {
            const vendas = await Vendas.find({ client: client, statuSales: 'sale', statusPay: 'wait', finish: 'yes', waiting: 'none' }).populate({ path: 'client funcionario', select: 'name' }).sort({ dateSave: 1 });

            const ordens = await OrdenServico.find({ client: client, statuSales: 'sale', statusPay: 'wait', finish: 'yes', waiting: 'none' }).populate({ path: 'client funcionario mecanico veicles', select: 'name model' }).sort({ dateSave: 1 });

            return res.status(200).send({ vendas, ordens });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para listar os pagamentos da venda no boleto
router.post('/listPaymentSaleBoleto', async (req, res) => {

    const { find, client, mes, ano } = req.body;

    try {

        //Buscar pelo Mês atual
        if (find === 1) {
            const payments = await PagamentoVendas.find({ boleto: true, month: meses[monthDate - 1], year: yearDate, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Período
        if (find === 2) {
            const payments = await PagamentoVendas.find({ boleto: true, month: mes, year: ano, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Cliente
        if (find === 3) {
            const payments = await PagamentoVendas.find({ boleto: true, cliente: client, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para listar os pagementos da ordem de serviço boleto
router.post('/listPaymentOrdersBoleto', async (req, res) => {

    const { find, client, mes, ano } = req.body;

    try {

        //Buscar pelo Mês atual
        if (find === 1) {
            const payments = await PagamentoServicos.find({ boleto: true, month: meses[monthDate - 1], year: yearDate, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Período
        if (find === 2) {
            const payments = await PagamentoServicos.find({ boleto: true, month: mes, year: ano, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Cliente
        if (find === 3) {
            const payments = await PagamentoServicos.find({ boleto: true, cliente: client, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para listar os pagamentos da venda no cheque
router.post('/listPaymentSaleCheque', async (req, res) => {

    const { find, client, mes, ano } = req.body;

    try {

        //Buscar pelo Mês atual
        if (find === 1) {
            const payments = await PagamentoVendas.find({ cheque: true, month: meses[monthDate - 1], year: yearDate, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Período
        if (find === 2) {
            const payments = await PagamentoVendas.find({ cheque: true, month: mes, year: ano, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Cliente
        if (find === 3) {
            const payments = await PagamentoVendas.find({ cheque: true, cliente: client, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para listar os pagementos da ordem de serviço boleto
router.post('/listPaymentOrdersCheque', async (req, res) => {

    const { find, client, mes, ano } = req.body;

    try {

        //Buscar pelo Mês atual
        if (find === 1) {
            const payments = await PagamentoServicos.find({ cheque: true, month: meses[monthDate - 1], year: yearDate, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Período
        if (find === 2) {
            const payments = await PagamentoServicos.find({ cheque: true, month: mes, year: ano, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Cliente
        if (find === 3) {
            const payments = await PagamentoServicos.find({ cheque: true, cliente: client, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para listar os pagamentos da venda Depósito ou transferencia
router.post('/listPaymentSaleAccData', async (req, res) => {

    const { find, client, mes, ano } = req.body;

    try {

        //Buscar pelo Mês atual
        if (find === 1) {
            const payments = await PagamentoVendas.find({ accData: true, month: meses[monthDate - 1], year: yearDate, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Período
        if (find === 2) {
            const payments = await PagamentoVendas.find({ accData: true, month: mes, year: ano, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Cliente
        if (find === 3) {
            const payments = await PagamentoVendas.find({ accData: true, cliente: client, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para listar os pagementos da ordem de serviço Depósito ou transferencia
router.post('/listPaymentOrdersAccData', async (req, res) => {

    const { find, client, mes, ano } = req.body;

    try {

        //Buscar pelo Mês atual
        if (find === 1) {
            const payments = await PagamentoServicos.find({ accData: true, month: meses[monthDate - 1], year: yearDate, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Período
        if (find === 2) {
            const payments = await PagamentoServicos.find({ accData: true, month: mes, year: ano, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

        //Buscar por Cliente
        if (find === 3) {
            const payments = await PagamentoServicos.find({ accData: true, cliente: client, statusPay: 'wait' }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

            return res.status(200).send({ payments });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para buscar os pagementos de uma venda
router.get('/findPaymentsById/:id', async (req, res) => {

    const { id } = req.params;

    try {

        const payments = await PagamentoVendas.find({ orders: id }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

        return res.status(200).send({ payments });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para buscar os pagamentos de uma Ordem de Serviço
router.get('/findPaymentsOrdersById/:id', async (req, res) => {

    const { id } = req.params;

    try {

        const payments = await PagamentoServicos.find({ orders: id }).populate({ path: 'cliente', select: 'name' }).sort({ dateToPay: 1 });

        return res.status(200).send({ payments });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao processar a requisição' });
    }

});

//Rota para alterar o status do pagamento de vendas (verificar se existir um pagamento em aberto, se não existir colocar o status da venda como pago)
router.put('/changePaymentSale/:id', async (req, res) => {

    const { id } = req.params;

    const { statusPay } = req.body;

    try {

        const findOrder = await PagamentoVendas.findOne({ _id: id }).select('orders');

        await PagamentoVendas.findByIdAndUpdate(id, { $set: { statusPay: statusPay } });

        const findPaymentsByOrder = await PagamentoVendas.find({ orders: findOrder.orders, statusPay: 'wait' });

        if (!findPaymentsByOrder.length) {
            await Vendas.findByIdAndUpdate(findOrder.orders, { $set: { statusPay: 'pay' } });

            const orderToPay = await Vendas.findOne({ _id: findOrder.orders });

            const findFunc = await Funcionarios.findOne({ _id: orderToPay.funcionario });

            if (findFunc.comissioned === true) {
                const comissao = orderToPay.valueLiquido * findFunc.comission / 100;
                const comissioParsed = parseFloat(comissao.toFixed(2));
                await Comissoes.create({
                    funcionario: findFunc._id, order: orderToPay._id, value: comissioParsed, month: meses[monthDate - 1], year: yearDate
                });
            }
        }

        return res.status(200).send({ message: 'Pagamento concluído com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao concluir o pagamento' });
    }

});

//Rota para alterar o status do pagamento de ordens de serviço
router.put('/changePaymentOrder/:id', async (req, res) => {

    const { id } = req.params;

    const { statusPay } = req.body;

    try {

        const findOrder = await PagamentoServicos.findOne({ _id: id }).select('orders');

        await PagamentoServicos.findByIdAndUpdate(id, { $set: { statusPay: statusPay } });

        const findPaymentsByOrder = await PagamentoServicos.find({ orders: findOrder.orders, statusPay: 'wait' });

        if (!findPaymentsByOrder.length) {
            await OrdenServico.findByIdAndUpdate(findOrder.orders, { $set: { statusPay: 'pay' } });
        }

        return res.status(200).send({ message: 'Pagamento concluído com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao concluir o pagamento' });
    }

});

//Rota para gerar um novo pagamento de uma parcela Vendas
router.post('/newPaymentParcelVendas', async (req, res) => {

    const { oldSale, payments } = req.body;

    const dataCadastro = dateFns.format(new Date(yearDate, monthDate - 1, dayDate), 'dd/MM/yyyy');

    try {

        const formasPagamento = await FormaPagamento.findOne({ _id: payments.paymentId });

        const order = await Vendas.findOne({ _id: oldSale.orders });

        const funcionar = await Funcionarios.find({ _id: order.funcionario });

        await PagamentoVendas.findByIdAndDelete(oldSale._id);

        if (payments.statusPayment === 'wait') {

            Date.prototype.addDias = function (dias) {
                this.setDate(this.getDate() + dias);
            }

            if (formasPagamento.boleto === true) {

                const unitParcela = oldSale.value / payments.parcelas;
                const valorParcela = parseFloat(unitParcela.toFixed(2));
                var parcela = 0;
                const limit = payments.parcelas;
                const interval = formasPagamento.intervalDays;
                var paymentInterval = formasPagamento.intervalDays;

                while (parcela < limit) {
                    const PaymentDate = new Date();
                    PaymentDate.addDias(paymentInterval);
                    const paymentDay = PaymentDate.getDate();
                    const paymentMouth = PaymentDate.getMonth() + 1;
                    const paymentYear = PaymentDate.getFullYear();
                    const NewPaymentDate = `${paymentDay}/${paymentMouth}/${paymentYear}`;
                    await incrementDate(paymentInterval);
                    await savePayment(NewPaymentDate, formasPagamento.name, paymentMouth, paymentYear, PaymentDate);
                    parcela++;
                }
                function incrementDate(value) {
                    paymentInterval = value + interval;
                }
                async function savePayment(date, name, mes, ano, data) {
                    await PagamentoVendas.create({
                        orders: oldSale.orders, title: `${name} ${parcela + 1}/${limit}`, value: valorParcela, statusPay: 'wait', datePay: date, month: meses[mes - 1], year: ano, dateToPay: data, planoDeConta: oldSale.planoDeConta, cliente: oldSale.cliente._id, boleto: true
                    });
                }
            }

            if (formasPagamento.cheque === true) {

                const unitParcela = oldSale.value / payments.parcelas;
                const valorParcela = parseFloat(unitParcela.toFixed(2));
                var parcela = 0;
                const limit = payments.parcelas;
                const interval = formasPagamento.intervalDays;
                var paymentInterval = formasPagamento.intervalDays;

                while (parcela < limit) {
                    const PaymentDate = new Date();
                    PaymentDate.addDias(paymentInterval);
                    const paymentDay = PaymentDate.getDate();
                    const paymentMouth = PaymentDate.getMonth() + 1;
                    const paymentYear = PaymentDate.getFullYear();
                    const NewPaymentDate = `${paymentDay}/${paymentMouth}/${paymentYear}`;
                    await incrementDate(paymentInterval);
                    await savePayment(NewPaymentDate, formasPagamento.name, paymentMouth, paymentYear, PaymentDate);
                    parcela++;
                }
                function incrementDate(value) {
                    paymentInterval = value + interval;
                }
                async function savePayment(date, name, mes, ano, data) {
                    await PagamentoVendas.create({
                        orders: oldSale.orders, title: `${name} ${parcela + 1}/${limit}`, value: valorParcela, statusPay: 'wait', datePay: date, month: meses[mes - 1], year: ano, dateToPay: data, planoDeConta: oldSale.planoDeConta, cliente: oldSale.cliente._id, cheque: true
                    });
                }
            }

            if (formasPagamento.accData === true) {

                const unitParcela = oldSale.value / payments.parcelas;
                const valorParcela = parseFloat(unitParcela.toFixed(2));
                var parcela = 0;
                const limit = payments.parcelas;
                const interval = formasPagamento.intervalDays;
                var paymentInterval = formasPagamento.intervalDays;

                while (parcela < limit) {
                    const PaymentDate = new Date();
                    PaymentDate.addDias(paymentInterval);
                    const paymentDay = PaymentDate.getDate();
                    const paymentMouth = PaymentDate.getMonth() + 1;
                    const paymentYear = PaymentDate.getFullYear();
                    const NewPaymentDate = `${paymentDay}/${paymentMouth}/${paymentYear}`;
                    await incrementDate(paymentInterval);
                    await savePayment(NewPaymentDate, formasPagamento.name, paymentMouth, paymentYear, PaymentDate);
                    parcela++;
                }
                function incrementDate(value) {
                    paymentInterval = value + interval;
                }
                async function savePayment(date, name, mes, ano, data) {
                    await PagamentoVendas.create({
                        orders: oldSale.orders, title: `${name} ${parcela + 1}/${limit}`, value: valorParcela, statusPay: 'wait', datePay: date, month: meses[mes - 1], year: ano, dateToPay: data, planoDeConta: oldSale.planoDeConta, cliente: oldSale.cliente._id, accData: true
                    });
                }
            }

            if (formasPagamento.credito === true) {

                const unitParcela = oldSale.value / payments.parcelas;
                const valorParcela = parseFloat(unitParcela.toFixed(2));
                var parcela = 0;
                const limit = payments.parcelas;
                const interval = formasPagamento.intervalDays;
                var paymentInterval = formasPagamento.intervalDays;

                while (parcela < limit) {
                    const PaymentDate = new Date();
                    PaymentDate.addDias(paymentInterval);
                    const paymentDay = PaymentDate.getDate();
                    const paymentMouth = PaymentDate.getMonth() + 1;
                    const paymentYear = PaymentDate.getFullYear();
                    const NewPaymentDate = `${paymentDay}/${paymentMouth}/${paymentYear}`;
                    await incrementDate(paymentInterval);
                    await savePayment(NewPaymentDate, formasPagamento.name, paymentMouth, paymentYear, PaymentDate);
                    parcela++;
                }
                function incrementDate(value) {
                    paymentInterval = value + interval;
                }
                async function savePayment(date, name, mes, ano, data) {
                    await PagamentoVendas.create({
                        orders: oldSale.orders, title: `${name} ${parcela + 1}/${limit}`, value: valorParcela, statusPay: 'pay', datePay: date, month: meses[mes - 1], year: ano, dateToPay: data, planoDeConta: oldSale.planoDeConta, cliente: oldSale.cliente._id, credito: true
                    });
                }

                const findPerPayments = await PagamentoVendas.find({ orders: oldSale.orders });

                if (!findPerPayments.length) {

                    await order.findByIdAndUpdate(oldSale.orders, { $set: { statusPay: 'pay' } });
                    if (funcionar.comissioned === true) {
                        const comissao = order.valueLiquido * funcionar.comission / 100;
                        const comissionParsed = parseFloat(comissao.toFixed(2));
                        const findOrder = await Comissoes.findOne({ order: oldSale.orders });
                        if (!findOrder) {
                            await Comissoes.create({
                                funcionario: funcionar._id, order: oldSale.orders, value: comissionParsed, month: meses[monthDate - 1], year: yearDate
                            });
                        }
                    }

                }
            }

        }

        if (payments.statusPayment === 'done') {

            await PagamentoVendas.create({
                orders: oldSale.orders, title: `${formasPagamento.name}`, value: payments.total, statusPay: 'pay', datePay: dataCadastro, month: meses[monthDate - 1], year: yearDate, dateToPay: DateNow, planoDeConta: oldSale.planoDeConta, cliente: oldSale.cliente._id
            });

            const findPerPayments = await PagamentoVendas.find({ orders: oldSale.orders });

            if (!findPerPayments.length) {

                await order.findByIdAndUpdate(oldSale.orders, { $set: { statusPay: 'pay' } });
                if (funcionar.comissioned === true) {
                    const comissao = order.valueLiquido * funcionar.comission / 100;
                    const comissionParsed = parseFloat(comissao.toFixed(2));
                    const findOrder = await Comissoes.findOne({ order: oldSale.orders });
                    if (!findOrder) {
                        await Comissoes.create({
                            funcionario: funcionar._id, order: oldSale.orders, value: comissionParsed, month: meses[monthDate - 1], year: yearDate
                        });
                    }
                }

            }

        }

        return res.status(200).send({ message: 'Pagamento criado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao concluir o pagamento' });
    }

});

//Rota para gerar um novo pagamento de uma parcela Ordens
router.post('/newPaymentParcelOrdens', async (req, res) => {

    const { oldSale, payments } = req.body;

    const dataCadastro = dateFns.format(new Date(yearDate, monthDate - 1, dayDate), 'dd/MM/yyyy');

    try {

        const formasPagamento = await FormaPagamento.findOne({ _id: payments.paymentId });

        const order = await OrdenServico.findOne({ _id: oldSale.orders });

        const funcionar = await Funcionarios.find({ _id: order.funcionario });

        await PagamentoServicos.findByIdAndDelete(oldSale._id);

        if (payments.statusPayment === 'wait') {

            Date.prototype.addDias = function (dias) {
                this.setDate(this.getDate() + dias);
            }

            if (formasPagamento.boleto === true) {

                const unitParcela = oldSale.value / payments.parcelas;
                const valorParcela = parseFloat(unitParcela.toFixed(2));

                var parcela = 0;
                const limit = payments.parcelas;
                const interval = formasPagamento.intervalDays;
                var paymentInterval = formasPagamento.intervalDays;

                while (parcela < limit) {
                    const PaymentDate = new Date();
                    PaymentDate.addDias(paymentInterval);
                    const paymentDay = PaymentDate.getDate();
                    const paymentMouth = PaymentDate.getMonth() + 1;
                    const paymentYear = PaymentDate.getFullYear();
                    const NewPaymentDate = `${paymentDay}/${paymentMouth}/${paymentYear}`;
                    await incrementDate(paymentInterval);
                    await savePayment(NewPaymentDate, formasPagamento.name, paymentMouth, paymentYear, PaymentDate);
                    parcela++;
                }
                function incrementDate(value) {
                    paymentInterval = value + interval;
                }
                async function savePayment(date, name, mes, ano, data) {
                    await PagamentoServicos.create({
                        orders: oldSale.orders, title: `${name} ${parcela + 1}/${limit}`, value: valorParcela, statusPay: 'wait', datePay: date, month: meses[mes - 1], year: ano, dateToPay: data, planoDeConta: oldSale.planoDeConta, cliente: oldSale.cliente._id, boleto: true
                    });
                }
            }

            if (formasPagamento.cheque === true) {

                const unitParcela = oldSale.value / payments.parcelas;
                const valorParcela = parseFloat(unitParcela.toFixed(2));

                var parcela = 0;
                const limit = payments.parcelas;
                const interval = formasPagamento.intervalDays;
                var paymentInterval = formasPagamento.intervalDays;

                while (parcela < limit) {
                    const PaymentDate = new Date();
                    PaymentDate.addDias(paymentInterval);
                    const paymentDay = PaymentDate.getDate();
                    const paymentMouth = PaymentDate.getMonth() + 1;
                    const paymentYear = PaymentDate.getFullYear();
                    const NewPaymentDate = `${paymentDay}/${paymentMouth}/${paymentYear}`;
                    await incrementDate(paymentInterval);
                    await savePayment(NewPaymentDate, formasPagamento.name, paymentMouth, paymentYear, PaymentDate);
                    parcela++;
                }
                function incrementDate(value) {
                    paymentInterval = value + interval;
                }
                async function savePayment(date, name, mes, ano, data) {
                    await PagamentoServicos.create({
                        orders: oldSale.orders, title: `${name} ${parcela + 1}/${limit}`, value: valorParcela, statusPay: 'wait', datePay: date, month: meses[mes - 1], year: ano, dateToPay: data, planoDeConta: oldSale.planoDeConta, cliente: oldSale.cliente._id, cheque: true
                    });
                }
            }

            if (formasPagamento.accData === true) {

                const unitParcela = oldSale.value / payments.parcelas;
                const valorParcela = parseFloat(unitParcela.toFixed(2));

                var parcela = 0;
                const limit = payments.parcelas;
                const interval = formasPagamento.intervalDays;
                var paymentInterval = formasPagamento.intervalDays;

                while (parcela < limit) {
                    const PaymentDate = new Date();
                    PaymentDate.addDias(paymentInterval);
                    const paymentDay = PaymentDate.getDate();
                    const paymentMouth = PaymentDate.getMonth() + 1;
                    const paymentYear = PaymentDate.getFullYear();
                    const NewPaymentDate = `${paymentDay}/${paymentMouth}/${paymentYear}`;
                    await incrementDate(paymentInterval);
                    await savePayment(NewPaymentDate, formasPagamento.name, paymentMouth, paymentYear, PaymentDate);
                    parcela++;
                }
                function incrementDate(value) {
                    paymentInterval = value + interval;
                }
                async function savePayment(date, name, mes, ano, data) {
                    await PagamentoServicos.create({
                        orders: oldSale.orders, title: `${name} ${parcela + 1}/${limit}`, value: valorParcela, statusPay: 'wait', datePay: date, month: meses[mes - 1], year: ano, dateToPay: data, planoDeConta: oldSale.planoDeConta, cliente: oldSale.cliente._id, accData: true
                    });
                }
            }

            if (formasPagamento.credito === true) {

                const unitParcela = oldSale.value / payments.parcelas;
                const valorParcela = parseFloat(unitParcela.toFixed(2));
                
                var parcela = 0;
                const limit = payments.parcelas;
                const interval = formasPagamento.intervalDays;
                var paymentInterval = formasPagamento.intervalDays;

                while (parcela < limit) {
                    const PaymentDate = new Date();
                    PaymentDate.addDias(paymentInterval);
                    const paymentDay = PaymentDate.getDate();
                    const paymentMouth = PaymentDate.getMonth() + 1;
                    const paymentYear = PaymentDate.getFullYear();
                    const NewPaymentDate = `${paymentDay}/${paymentMouth}/${paymentYear}`;
                    await incrementDate(paymentInterval);
                    await savePayment(NewPaymentDate, formasPagamento.name, paymentMouth, paymentYear, PaymentDate);
                    parcela++;
                }
                function incrementDate(value) {
                    paymentInterval = value + interval;
                }
                async function savePayment(date, name, mes, ano, data) {
                    await PagamentoServicos.create({
                        orders: oldSale.orders, title: `${name} ${parcela + 1}/${limit}`, value: valorParcela, statusPay: 'pay', datePay: date, month: meses[mes - 1], year: ano, dateToPay: data, planoDeConta: oldSale.planoDeConta, cliente: oldSale.cliente._id, credito: true
                    });
                }

                const findPerPayments = await PagamentoServicos.find({ orders: oldSale.orders });

                if (!findPerPayments.length) {
                    await order.findByIdAndUpdate(oldSale.orders, { $set: { statusPay: 'pay' } });
                }
            }

        }

        if (payments.statusPayment === 'done') {

            await PagamentoServicos.create({
                orders: oldSale.orders, title: `${formasPagamento.name}`, value: payments.total, statusPay: 'pay', datePay: dataCadastro, month: meses[monthDate - 1], year: yearDate, dateToPay: DateNow, planoDeConta: oldSale.planoDeConta, cliente: oldSale.cliente._id, valueServices: oldSale.valueServices, valueProducts: oldSale.valueServices
            });

            const findPerPayments = await PagamentoServicos.find({ orders: oldSale.orders });

            if (!findPerPayments.length) {
                await order.findByIdAndUpdate(oldSale.orders, { $set: { statusPay: 'pay' } });
            }

        }

        return res.status(200).send({ message: 'Pagamento criado com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao concluir o pagamento' });
    }

});

//Rota para gerar um boleto vendas
router.post('/gerBoletoVenda', async (req, res) => {
    const { idPayment } = req.body;
    try {
        const findPayment = await PagamentoVendas.findOne({ _id: idPayment });
        const findClient = await Clientes.findOne({ _id: findPayment.cliente });
        const data = dateFns.format(findPayment.dateToPay, 'yyyy-MM-dd');
        if (findClient.typeClient === 'fisic') {
            let cpfCnpj = findClient.cpf_cnpj;
            let noPointer = cpfCnpj.split(".").join('');
            let noTracer = noPointer.split("-").join('');
            let amount = findPayment.value;
            let amountFormated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2});
            let valueParsed = amountFormated.replace(',','');
            let valueFinal = parseInt(valueParsed);
            pagarme.client.connect({ api_key: apiKey.apiKey })
                .then(client => client.transactions.create({
                    amount: valueFinal,
                    payment_method: 'boleto',
                    boleto_expiration_date: data,
                    capture: true,
                    customer: {
                        type: 'individual',
                        country: 'br',
                        name: findClient.name,
                        email: findClient.email,
                        documents: [
                            {
                                type: 'cpf',
                                number: noTracer,
                            },
                        ],
                    },
                })).then(transaction => {
                    saveInformationCpf(transaction);
                }).catch(error => {
                    const messagem = error.response.errors[0].message;
                    return res.status(400).send({ message: messagem });
                });
            async function saveInformationCpf(info) {
                await PagamentoVendas.findByIdAndUpdate(idPayment, {
                    $set: { transactionId: info.id, boletoUrl: info.boleto_url }
                });
                const payment = await PagamentoVendas.findOne({ _id: idPayment });
                return res.status(200).send({ payment });
            }
        }
        if (findClient.typeClient === 'juridic') {
            let cpfCnpj = findClient.cpf_cnpj;
            let noPointer = cpfCnpj.split(".").join('');
            let noTracer = noPointer.split("-").join('');
            let noBars = noTracer.split("/").join('');
            let amount = findPayment.value;
            let amountFormated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2});
            let valueParsed = amountFormated.replace(',','');
            let valueFinal = parseInt(valueParsed);
            pagarme.client.connect({ api_key: apiKey.apiKey })
                .then(client => client.transactions.create({
                    amount: valueFinal,
                    payment_method: 'boleto',
                    boleto_expiration_date: data,
                    capture: true,
                    customer: {
                        type: 'corporation',
                        country: 'br',
                        name: findClient.name,
                        email: findClient.email,
                        documents: [
                            {
                                type: 'cnpj',
                                number: noBars,
                            },
                        ],
                    },
                })).then(transaction => {
                    saveInformation(transaction);
                }).catch(error => {
                    const messagem = error.response.errors[0].message;
                    return res.status(400).send({ message: messagem });
                });
            async function saveInformation(info) {
                await PagamentoVendas.findByIdAndUpdate(idPayment, {
                    $set: { transactionId: info.id, boletoUrl: info.boleto_url }
                });
                const payment = await PagamentoVendas.findOne({ _id: idPayment });
                return res.status(200).send({ payment });
            }
        }
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao cadastrar boleto' });
    }
});

//Rota para gerar um boleto ordens
router.post('/gerBoletoOrdens', async (req, res) => {
    const { idPayment } = req.body;
    try {
        const findPayment = await PagamentoServicos.findOne({ _id: idPayment });
        const findClient = await Clientes.findOne({ _id: findPayment.cliente });
        const data = dateFns.format(findPayment.dateToPay, 'yyyy-MM-dd');
        if (findClient.typeClient === 'fisic') {
            let cpfCnpj = findClient.cpf_cnpj;
            let noPointer = cpfCnpj.split(".").join('');
            let noTracer = noPointer.split("-").join('');
            let amount = findPayment.value;
            let amountFormated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2});
            let valueParsed = amountFormated.replace(',','');
            let valueFinal = parseInt(valueParsed);
            pagarme.client.connect({ api_key: apiKey.apiKey })
                .then(client => client.transactions.create({
                    amount: valueFinal,
                    payment_method: 'boleto',
                    boleto_expiration_date: data,
                    customer: {
                        type: 'individual',
                        country: 'br',
                        name: findClient.name,
                        email: findClient.email,
                        documents: [
                            {
                                type: 'cpf',
                                number: noTracer,
                            },
                        ],
                    },
                })).then(transaction => {
                    saveInformationCpf(transaction);
                }).catch(error => {
                    const messagem = error.response.errors[0].message;
                    return res.status(400).send({ message: messagem });
                });
            async function saveInformationCpf(info) {
                await PagamentoServicos.findByIdAndUpdate(idPayment, {
                    $set: { transactionId: info.id, boletoUrl: info.boleto_url }
                });
                const payment = await PagamentoServicos.findOne({ _id: idPayment });
                return res.status(200).send({ payment });
            }
        }
        if (findClient.typeClient === 'juridic') {
            let cpfCnpj = findClient.cpf_cnpj;
            let noPointer = cpfCnpj.split(".").join('');
            let noTracer = noPointer.split("-").join('');
            let noBars = noTracer.split("/").join('');
            let amount = findPayment.value;
            let amountFormated = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2});
            let valueParsed = amountFormated.replace(',','');
            let valueFinal = parseInt(valueParsed);
            pagarme.client.connect({ api_key: apiKey.apiKey })
                .then(client => client.transactions.create({
                    amount: valueFinal,
                    payment_method: 'boleto',
                    boleto_expiration_date: data,
                    customer: {
                        type: 'corporation',
                        country: 'br',
                        name: findClient.name,
                        email: findClient.email,
                        documents: [
                            {
                                type: 'cnpj',
                                number: noBars,
                            },
                        ],
                    },
                })).then(transaction => {
                    saveInformation(transaction);
                }).catch(error => {
                    const messagem = error.response.errors[0].message;
                    return res.status(400).send({ message: messagem });
                });
            async function saveInformation(info) {
                await PagamentoServicos.findByIdAndUpdate(idPayment, {
                    $set: { transactionId: info.id, boletoUrl: info.boleto_url }
                });
                const payment = await PagamentoServicos.findOne({ _id: idPayment });
                return res.status(200).send({ payment });
            }
        }
    } catch (error) {
        return res.status(400).send({ message: 'Erro ao cadastrar boleto' });
    }
});

//Rota para verificar se boleto foi pago vendas
router.post('/verifyPaymentSale', async (req, res) => {

    const { idPayment } = req.body;
    try {

        const findPayment = await PagamentoVendas.findOne({ _id: idPayment });

        pagarme.client.connect({ api_key: apiKey.apiKey })
            .then(client => client.transactions.find({ id: findPayment.transactionId }))
            .then(transaction => {
                if(transaction.status === 'waiting_payment') {
                    return res.status(200).send({ message: 'Pagamento não identificado, este boleto está em aberto' });
                }
                if(transaction.status === 'paid') {
                    updateStatusPayment();
                    return res.status(200).send({ message: 'Pagamento confirmado' });
                }
                if(transaction.status === 'pending_refund') {
                    return res.status(200).send({ message: 'Este pagamento está em processo de estorno' });
                }
                async function updateStatusPayment() {             
                    await PagamentoVendas.findByIdAndUpdate(idPayment, { $set: { statusPay: 'pay' } });
                    
                    const findPaymentsOrder = await PagamentoVendas.find({ orders: findPayment.orders, statusPay: 'wait' });

                    if(!findPaymentsOrder.length) {
                        const sale = await Vendas.findOne({ _id: findPayment.orders });
                        await Vendas.findByIdAndUpdate(sale._id, { $set: { statusPay: 'pay' } });
                        const findFunc = await Funcionarios.findOne({ _id: sale.funcionario });
                        if (findFunc.comissioned === true) {
                            const comissao = sale.valueLiquido * findFunc.comission / 100;
                            const comissioParsed = parseFloat(comissao.toFixed(2));
                            await Comissoes.create({
                                funcionario: findFunc._id, order: sale._id, value: comissioParsed, month: meses[monthDate - 1], year: yearDate
                            });
                        }
                    }
                }
            }).catch(error => {
                return res.status(400).send({ error });
            });

    } catch (error) {
        return res.status(400).send({ message: 'Ocorreu um erro ao realizar a operação' });
    }

});

//Rota para verificar se boleto foi pago ordens
router.post('/verifyPaymentOrder', async (req, res) => {

    const { idPayment } = req.body;
    try {

        const findPayment = await PagamentoServicos.findOne({ _id: idPayment });

        pagarme.client.connect({ api_key: apiKey.apiKey })
            .then(client => client.transactions.find({ id: findPayment.transactionId }))
            .then(transaction => {
                if(transaction.status === 'waiting_payment') {
                    return res.status(200).send({ message: 'Pagamento não identificado, este boleto está em aberto' });
                }
                if(transaction.status === 'paid') {
                    updateStatusPayment();
                    return res.status(200).send({ message: 'Pagamento confirmado' });
                }
                if(transaction.status === 'pending_refund') {
                    return res.status(200).send({ message: 'Este pagamento está em processo de estorno' });
                }
                async function updateStatusPayment() {
                    await PagamentoServicos.findByIdAndUpdate(idPayment, { $set: { statusPay: 'pay' } });
                }
            }).catch(error => {
                return res.status(400).send({ error });
            });

    } catch (error) {
        return res.status(400).send({ message: 'Ocorreu um erro ao realizar a operação' });
    }

});

//Rota para listar as vendas com pagamento em boleto
router.post('/listBoletoSale', async (req, res) => {

    const { find, client } = req.body;

    try {
        
        if(find === 1) {
            const vendas = await Vendas.find({ statuSales: 'sale', statusPay: 'wait', waiting: 'none', finish: 'yes', boleto: true }).populate({ path: 'planoDeConta funcionario client', select: 'name planoConta' });

            return res.status(200).send({ vendas });
        }
        
        if(find === 2) {
            const vendas = await Vendas.find({ client: client, statuSales: 'sale', statusPay: 'wait', waiting: 'none', finish: 'yes', boleto: true }).populate({ path: 'planoDeConta funcionario client', select: 'name planoConta' });

            return res.status(200).send({ vendas });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar os dados' });
    }

});

//Rota para listar as ordens com pagamento em boleto
router.post('/listBoletoOrder', async (req, res) => {

    const { find, client } = req.body;

    try {
        
        if(find === 1) {
            const vendas = await OrdenServico.find({ statuSales: 'sale', statusPay: 'wait', waiting: 'none', finish: 'yes', boleto: true }).populate({ path: 'planoDeConta funcionario client', select: 'name planoConta' });

            return res.status(200).send({ vendas });
        }
        
        if(find === 2) {
            const vendas = await OrdenServico.find({ client: client, statuSales: 'sale', statusPay: 'wait', waiting: 'none', finish: 'yes', boleto: true }).populate({ path: 'planoDeConta funcionario client', select: 'name planoConta' });

            return res.status(200).send({ vendas });
        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar os dados' });
    }

});

//Rota para excluir todos os pagamentos de uma venda
router.delete('/delAllPaymentSale/:id', async (req, res) => {
    const { id } = req.params;

    try {
        
        await PagamentoVendas.deleteMany({ orders: id });

        return res.status(200).send({ message: 'Pagamentos excluídos com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao excluir os pagamentos' });
    }
});

//Rota para excluir todos os pagamentos de uma Ordem de Serviço
router.delete('/delAllPaymentOrder/:id', async (req, res) => {
    const { id } = req.params;

    try {
        
        await PagamentoServicos.deleteMany({ orders: id });

        return res.status(200).send({ message: 'Pagamentos excluídos com sucesso' });

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao excluir os pagamentos' });
    }
});

module.exports = app => app.use('/payments', router);
