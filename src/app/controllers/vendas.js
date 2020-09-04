const express = require("express");
const router = express.Router();
const Ordens = require("../models/ordens");
const OrdensServico = require("../models/ordenServico");
const Clientes = require("../models/clientes");
const FormaPagamento = require("../models/formaPagamento");
const Produtos = require("../models/produtos");
const Servicos = require("../models/servicos");
const Funcionario = require("../models/funcionarios");
const Comissao = require("../models/comissions");
const Enderecos = require("../models/enderecos");
const Pagamentos = require("../models/pagamentosVendas");
const PagamentosServicos = require("../models/pagamentosServicos");
const PlanodeContas = require("../models/planoDeContas");
const RascNfe = require("../models/nfe");
const dateFns = require("date-fns");
const DateNow = new Date();
const dayDate = DateNow.getDate();
const monthDate = DateNow.getMonth() + 1;
const yearDate = DateNow.getFullYear();
const dataCadastro = dateFns.format(
  new Date(yearDate, monthDate - 1, dayDate),
  "dd/MM/yyyy"
);
const meses = new Array(
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
);

//Rota para efetuar uma venda
router.post("/createSale", async (req, res) => {
  const {
    client,
    funcionario,
    products,
    statuSales,
    desconto,
    valueLiquido,
    valueBruto,
    obs,
    address,
    data,
    descontoValue,
    refOrderService,
  } = req.body;

  let dateToSave = dateFns.format(new Date(data), "dd/MM/yyyy");
  let novaData = new Date(data);
  let novoMes = novaData.getMonth();
  let novoAno = novaData.getFullYear();

  const clientInfo = await Clientes.findOne({ _id: client }).select("restrict");
  const findPlanoContas = await PlanodeContas.findOne({
    planoConta: "VENDA DE PRODUTOS",
  });
  const produtos = await Produtos.find();
  const getNumber = await Ordens.find().sort({ $natural: -1 }).limit(1);

  if (!findPlanoContas) {
    return res
      .status(400)
      .send({ message: "Não existe um plano de contas cadastrado" });
  }

  try {
    let Waiting = null;
    let orderNumber;

    if (clientInfo.restrict === true) {
      Waiting = "yes";
    } else {
      Waiting = "none";
    }

    if (!getNumber.length) {
      orderNumber = 1;
    } else {
      orderNumber = getNumber[0].number + 1;
    }

    const ordem = await Ordens.create({
      client,
      funcionario,
      products,
      statuSales,
      desconto,
      valueLiquido,
      valueBruto,
      createDate: dateToSave,
      month: meses[novoMes],
      year: novoAno,
      waiting: Waiting,
      planoDeConta: findPlanoContas._id,
      obs,
      number: orderNumber,
      address,
      dateSave: novaData,
      valueDesconto: descontoValue,
      refOrderService,
    });

    //** ATUALIZANDO O ESTOQUE *//

    await products.map((element) => {
      const result = produtos.find((obj) => obj._id == element.product);
      const total = result.estoqueAct - element.quantity;
      UpdateDB(element.product, total);
    });

    async function UpdateDB(id, result) {
      await Produtos.update({ _id: id }, { $set: { estoqueAct: result } });
    }

    //** FINAL DA ATUALIZAÇÃO */

    if (Waiting === "yes") {
      return res.status(200).send({
        message:
          "Este cliente possui restrições, esta venda está em análise, consulte seu gerente",
        ordem,
      });
    } else {
      return res.status(200).send({ ordem });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Erro ao concluir a venda" });
  }
});

//Rota para salvar um orçamento no balcão de vendas
router.put("/changeOrcamentBalcao/:id", async (req, res) => {
  const { id } = req.params;
  const { products, totalBrut, totalLiquid, desc, obs } = req.body;
  try {
    const produtos = await Produtos.find();
    const actVenda = await Ordens.findOne({ _id: id });

    await products.map((prod) => {
      managerProducts(prod);
    });

    async function managerProducts(prod) {
      const result = await actVenda.products.find(
        (obj) => obj.code === prod.code
      );
      if (!result) {
        await Ordens.update(
          { _id: actVenda._id },
          { $push: { products: prod } }
        );
        const saldo = await produtos.find((obj) => obj.code === prod.code);
        let final = saldo.estoqueAct - prod.quantity;
        console.log(final);
        await Produtos.update(
          { code: prod.code },
          { $set: { estoqueAct: final } }
        );
      }
    }

    await Ordens.findByIdAndUpdate(id, {
      $set: {
        desconto: desc,
        valueLiquido: totalLiquid,
        valueBruto: totalBrut,
        obs: obs,
      },
    });

    return res.status(200).send({ message: "Orçamento salvo com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao salvar o orçamento" });
  }
});

//Rota para salvar um orçamento no balcão de vendas
router.put("/completeOrcamentBalcao/:id", async (req, res) => {
  const { id } = req.params;
  const { products, totalBrut, totalLiquid, desc } = req.body;
  try {
    const produtos = await Produtos.find();
    const actVenda = await Ordens.findOne({ _id: id });

    await products.map((prod) => {
      managerProducts(prod);
    });

    async function managerProducts(prod) {
      const result = await actVenda.products.find(
        (obj) => obj.code === prod.code
      );
      if (!result) {
        await Ordens.update(
          { _id: actVenda._id },
          { $push: { products: prod } }
        );
        const saldo = await produtos.find((obj) => obj.code === prod.code);
        let final = saldo.estoqueAct - prod.quantity;
        console.log(final);
        await Produtos.update(
          { code: prod.code },
          { $set: { estoqueAct: final } }
        );
      }
    }

    await Ordens.findByIdAndUpdate(id, {
      $set: {
        desconto: desc,
        valueLiquido: totalLiquid,
        valueBruto: totalBrut,
        statuSales: "sale",
        obs: obs,
      },
    });

    const ordem = await Ordens.findOne({ _id: id });

    return res.status(200).send({ ordem });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao salvar o orçamento" });
  }
});

//Rota para adicionar um pagamento de vendas
router.post("/createPaymentSale", async (req, res) => {
  const { orderId, payment } = req.body;
  const formasPagamento = await FormaPagamento.find();

  try {
    await payment.map((pay) => {
      const restult = formasPagamento.find((obj) => obj._id == pay.paymentId);
      setPayments(restult, pay);
    });

    async function setPayments(forma, pay) {
      let valueParcela;
      let qtdParcela = await pay.parcelas;
      if (pay.parcelas > 0) {
        valueParcela = pay.total / pay.parcelas;
      } else {
        valueParcela = pay.total;
      }
      await Ordens.findOneAndUpdate(
        { _id: orderId },
        {
          $push: {
            payments: {
              paymentName: forma.name,
              paymentParcela: qtdParcela,
              paymentValue: valueParcela,
            },
          },
        }
      );
    }

    const findPagamentos = await Pagamentos.find({ orders: orderId });

    const findOrders = await Ordens.findOne({ _id: orderId });

    const findPlanoContas = await PlanodeContas.findOne({
      planoConta: "VENDA DE PRODUTOS",
    });

    const func = await Funcionario.findOne({
      _id: findOrders.funcionario,
    }).select("comissioned comission");

    const dataParaSalvar = findOrders.dateSave;

    const newDate = new Date(dataParaSalvar);
    const newMonth = newDate.getMonth();
    const newYear = newDate.getFullYear();

    if (findPagamentos.length) {
      return res.status(400).send({
        message: "Esta venda já possui suas formas de pagamento cadastradas",
      });
    }

    const findParc = await payment.find((obj) => obj.statusPayment === "wait");

    if (findParc) {
      await payment.map((pay) => {
        const result = formasPagamento.find(
          (forma) => forma._id == pay.paymentId
        );
        CreatePayment(result, pay);
      });

      async function CreatePayment(payment, pay) {
        Date.prototype.addDias = function (dias) {
          this.setDate(this.getDate() + dias);
        };

        if (payment.statusPay === "parc") {
          if (payment.boleto === true) {
            const unitParcela = pay.total / pay.parcelas;
            const valorParcela = parseFloat(unitParcela);
            var parcela = 0;
            const limit = pay.parcelas;
            const interval = payment.intervalDays;
            var paymentInterval = payment.intervalDays;

            while (parcela < limit) {
              const PaymentDate = new Date(dataParaSalvar);
              PaymentDate.addDias(paymentInterval);
              const paymentDay = PaymentDate.getDate();
              const paymentMouth = PaymentDate.getMonth() + 1;
              const paymentYear = PaymentDate.getFullYear();
              const NewPaymentDate = dateFns.format(
                new Date(paymentYear, paymentMouth - 1, paymentDay),
                "dd/MM/yyyy"
              );
              await incrementDate(paymentInterval);
              await savePayment(
                NewPaymentDate,
                payment.name,
                paymentMouth,
                paymentYear,
                PaymentDate
              );
              parcela++;
            }
            function incrementDate(value) {
              paymentInterval = value + interval;
            }
            async function savePayment(date, name, mes, ano, data) {
              await Pagamentos.create({
                orders: orderId,
                title: `${name} ${parcela + 1}/${limit}`,
                value: valorParcela,
                statusPay: "wait",
                datePay: date,
                month: meses[mes - 1],
                year: ano,
                dateToPay: data,
                planoDeConta: findPlanoContas._id,
                cliente: findOrders.client,
                boleto: true,
              });
            }
            await Ordens.findByIdAndUpdate(orderId, { $set: { boleto: true } });
          }

          if (payment.cheque === true) {
            const unitParcela = pay.total / pay.parcelas;
            const valorParcela = parseFloat(unitParcela);
            var parcela = 0;
            const limit = pay.parcelas;
            const interval = payment.intervalDays;
            var paymentInterval = payment.intervalDays;

            while (parcela < limit) {
              const PaymentDate = new Date(dataParaSalvar);
              PaymentDate.addDias(paymentInterval);
              const paymentDay = PaymentDate.getDate();
              const paymentMouth = PaymentDate.getMonth() + 1;
              const paymentYear = PaymentDate.getFullYear();
              const NewPaymentDate = dateFns.format(
                new Date(paymentYear, paymentMouth - 1, paymentDay),
                "dd/MM/yyyy"
              );
              await incrementDate(paymentInterval);
              await savePayment(
                NewPaymentDate,
                payment.name,
                paymentMouth,
                paymentYear,
                PaymentDate
              );
              parcela++;
            }
            function incrementDate(value) {
              paymentInterval = value + interval;
            }
            async function savePayment(date, name, mes, ano, data) {
              await Pagamentos.create({
                orders: orderId,
                title: `${name} ${parcela + 1}/${limit}`,
                value: valorParcela,
                statusPay: "wait",
                datePay: date,
                month: meses[mes - 1],
                year: ano,
                dateToPay: data,
                planoDeConta: findPlanoContas._id,
                cliente: findOrders.client,
                cheque: true,
              });
            }
          }

          if (payment.accData === true) {
            const unitParcela = pay.total / pay.parcelas;
            const valorParcela = parseFloat(unitParcela);
            var parcela = 0;
            const limit = pay.parcelas;
            const interval = payment.intervalDays;
            var paymentInterval = payment.intervalDays;

            while (parcela < limit) {
              const PaymentDate = new Date(dataParaSalvar);
              PaymentDate.addDias(paymentInterval);
              const paymentDay = PaymentDate.getDate();
              const paymentMouth = PaymentDate.getMonth() + 1;
              const paymentYear = PaymentDate.getFullYear();
              const NewPaymentDate = dateFns.format(
                new Date(paymentYear, paymentMouth - 1, paymentDay),
                "dd/MM/yyyy"
              );
              await incrementDate(paymentInterval);
              await savePayment(
                NewPaymentDate,
                payment.name,
                paymentMouth,
                paymentYear,
                PaymentDate
              );
              parcela++;
            }
            function incrementDate(value) {
              paymentInterval = value + interval;
            }
            async function savePayment(date, name, mes, ano, data) {
              await Pagamentos.create({
                orders: orderId,
                title: `${name} ${parcela + 1}/${limit}`,
                value: valorParcela,
                statusPay: "wait",
                datePay: date,
                month: meses[mes - 1],
                year: ano,
                dateToPay: data,
                planoDeConta: findPlanoContas._id,
                cliente: findOrders.client,
                accData: true,
              });
            }
          }

          if (payment.credito === true) {
            const unitParcela = pay.total / pay.parcelas;
            const valorParcela = parseFloat(unitParcela);
            var parcela = 0;
            const limit = pay.parcelas;
            const interval = payment.intervalDays;
            var paymentInterval = payment.intervalDays;

            while (parcela < limit) {
              const PaymentDate = new Date(dataParaSalvar);
              PaymentDate.addDias(paymentInterval);
              const paymentDay = PaymentDate.getDate();
              const paymentMouth = PaymentDate.getMonth() + 1;
              const paymentYear = PaymentDate.getFullYear();
              const NewPaymentDate = dateFns.format(
                new Date(paymentYear, paymentMouth - 1, paymentDay),
                "dd/MM/yyyy"
              );
              await incrementDate(paymentInterval);
              await savePayment(
                NewPaymentDate,
                payment.name,
                paymentMouth,
                paymentYear,
                PaymentDate
              );
              parcela++;
            }
            function incrementDate(value) {
              paymentInterval = value + interval;
            }
            async function savePayment(date, name, mes, ano, data) {
              await Pagamentos.create({
                orders: orderId,
                title: `${name} ${parcela + 1}/${limit}`,
                value: valorParcela,
                statusPay: "pay",
                datePay: date,
                month: meses[mes - 1],
                year: ano,
                dateToPay: data,
                planoDeConta: findPlanoContas._id,
                cliente: findOrders.client,
                credito: true,
              });
            }
            await Ordens.findByIdAndUpdate(orderId, {
              $set: { statusPay: "pay" },
            });
            if (func.comissioned === true) {
              const comissao = (findOrders.valueLiquido * func.comission) / 100;
              const comissionParsed = parseFloat(comissao);
              const findOrder = await Comissao.findOne({ order: orderId });
              if (!findOrder) {
                await Comissao.create({
                  funcionario: func._id,
                  order: orderId,
                  value: comissionParsed,
                  month: meses[newMonth],
                  year: newYear,
                });
              }
            }
          }
        } else {
          await Pagamentos.create({
            orders: orderId,
            title: `${payment.name}`,
            value: pay.total,
            statusPay: "pay",
            datePay: dateFns.format(new Date(dataParaSalvar), "dd/MM/yyyy"),
            month: meses[newMonth],
            year: newYear,
            dateToPay: newDate,
            planoDeConta: findPlanoContas._id,
            cliente: findOrders.client,
          });
        }
      }
    } else {
      await payment.map((pay) => {
        const result = formasPagamento.find(
          (forma) => forma._id == pay.paymentId
        );
        CreatePaymentVista(result, pay);
      });
      async function CreatePaymentVista(payment, pay) {
        await Pagamentos.create({
          orders: orderId,
          title: `${payment.name}`,
          value: pay.total,
          statusPay: "pay",
          datePay: dateFns.format(new Date(dataParaSalvar), "dd/MM/yyyy"),
          month: meses[newMonth],
          year: newYear,
          dateToPay: newDate,
          planoDeConta: findPlanoContas._id,
          cliente: findOrders.client,
        });
      }

      if (func.comissioned === true) {
        const comissao = (findOrders.valueLiquido * func.comission) / 100;
        const comissionParsed = parseFloat(comissao);
        const findOrder = await Comissao.findOne({ order: orderId });
        if (!findOrder) {
          await Comissao.create({
            funcionario: func._id,
            order: orderId,
            value: comissionParsed,
            month: meses[newMonth],
            year: newYear,
          });
        }
      }
      await Ordens.findByIdAndUpdate(orderId, { $set: { statusPay: "pay" } });
    }

    return res.status(200).send({ message: "Venda concluída com sucesso" });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Ocorreu um erro ao concluir a venda" });
  }
});

//Rota para adicionar um pagamento de Serviços
router.post("/createPaymentService", async (req, res) => {
  const { orderId, payment } = req.body;
  const formasPagamento = await FormaPagamento.find();

  try {
    await payment.map((pay) => {
      const restult = formasPagamento.find((obj) => obj._id == pay.paymentId);
      setPayments(restult, pay);
    });

    async function setPayments(forma, pay) {
      let valueParcela;
      let qtdParcela = await pay.parcelas;
      if (pay.parcelas > 0) {
        valueParcela = pay.total / pay.parcelas;
      } else {
        valueParcela = pay.total;
      }
      await OrdensServico.findOneAndUpdate(
        { _id: orderId },
        {
          $push: {
            payments: {
              paymentName: forma.name,
              paymentParcela: qtdParcela,
              paymentValue: valueParcela,
            },
          },
        }
      );
    }

    const findOrders = await OrdensServico.findOne({ _id: orderId });

    const findPagamentos = await PagamentosServicos.find({ orders: orderId });

    const findPlanoContas = await PlanodeContas.findOne({
      planoConta: "PRESTAÇÃO DE SERVIÇO",
    });

    const dataParaSalvar = findOrders.dateSave;

    const newDate = new Date(dataParaSalvar);
    const newMonth = newDate.getMonth();
    const newYear = newDate.getFullYear();

    if (findPagamentos.length) {
      return res.status(400).send({
        message: "Esta venda já possui suas formas de pagamento cadastradas",
      });
    }

    const findParc = await payment.find((obj) => obj.statusPayment === "wait");

    if (findParc) {
      await payment.map((pay) => {
        const result = formasPagamento.find(
          (forma) => forma._id == pay.paymentId
        );
        CreatePayment(result, pay);
      });

      async function CreatePayment(paymentService, pay) {
        Date.prototype.addDias = function (dias) {
          this.setDate(this.getDate() + dias);
        };

        if (paymentService.statusPay === "parc") {
          if (paymentService.boleto === true) {
            const unitParcela = pay.total / pay.parcelas;
            const valorParcela = parseFloat(unitParcela);

            var parcela = 0;
            const limit = pay.parcelas;
            const interval = paymentService.intervalDays;
            var paymentInterval = paymentService.intervalDays;

            while (parcela < limit) {
              const PaymentDate = new Date(dataParaSalvar);
              PaymentDate.addDias(paymentInterval);
              const paymentDay = PaymentDate.getDate();
              const paymentMouth = PaymentDate.getMonth() + 1;
              const paymentYear = PaymentDate.getFullYear();
              const NewPaymentDate = dateFns.format(
                new Date(paymentYear, paymentMouth - 1, paymentDay),
                "dd/MM/yyyy"
              );

              await incrementDate(paymentInterval);

              await savePayment(
                NewPaymentDate,
                paymentService.name,
                paymentMouth,
                paymentYear,
                PaymentDate
              );

              parcela++;
            }

            function incrementDate(value) {
              paymentInterval = value + interval;
            }

            async function savePayment(date, name, mes, ano, data) {
              await PagamentosServicos.create({
                orders: orderId,
                title: `${name} ${parcela + 1}/${limit}`,
                value: valorParcela,
                statusPay: "wait",
                datePay: date,
                month: meses[mes - 1],
                year: ano,
                dateToPay: data,
                planoDeConta: findPlanoContas._id,
                cliente: findOrders.client,
                boleto: true,
              });
            }
            await OrdensServico.findByIdAndUpdate(orderId, {
              $set: { boleto: true },
            });
          }

          if (paymentService.cheque === true) {
            const unitParcela = pay.total / pay.parcelas;
            const valorParcela = parseFloat(unitParcela);

            var parcela = 0;
            const limit = pay.parcelas;
            const interval = paymentService.intervalDays;
            var paymentInterval = paymentService.intervalDays;

            while (parcela < limit) {
              const PaymentDate = new Date(dataParaSalvar);
              PaymentDate.addDias(paymentInterval);
              const paymentDay = PaymentDate.getDate();
              const paymentMouth = PaymentDate.getMonth() + 1;
              const paymentYear = PaymentDate.getFullYear();
              const NewPaymentDate = dateFns.format(
                new Date(paymentYear, paymentMouth - 1, paymentDay),
                "dd/MM/yyyy"
              );

              await incrementDate(paymentInterval);

              await savePayment(
                NewPaymentDate,
                paymentService.name,
                paymentMouth,
                paymentYear,
                PaymentDate
              );

              parcela++;
            }

            function incrementDate(value) {
              paymentInterval = value + interval;
            }

            async function savePayment(date, name, mes, ano, data) {
              await PagamentosServicos.create({
                orders: orderId,
                title: `${name} ${parcela + 1}/${limit}`,
                value: valorParcela,
                statusPay: "wait",
                datePay: date,
                month: meses[mes - 1],
                year: ano,
                dateToPay: data,
                planoDeConta: findPlanoContas._id,
                cliente: findOrders.client,
                cheque: true,
              });
            }
          }

          if (paymentService.accData === true) {
            const unitParcela = pay.total / pay.parcelas;
            const valorParcela = parseFloat(unitParcela);

            var parcela = 0;
            const limit = pay.parcelas;
            const interval = paymentService.intervalDays;
            var paymentInterval = paymentService.intervalDays;

            while (parcela < limit) {
              const PaymentDate = new Date(dataParaSalvar);
              PaymentDate.addDias(paymentInterval);
              const paymentDay = PaymentDate.getDate();
              const paymentMouth = PaymentDate.getMonth() + 1;
              const paymentYear = PaymentDate.getFullYear();
              const NewPaymentDate = dateFns.format(
                new Date(paymentYear, paymentMouth - 1, paymentDay),
                "dd/MM/yyyy"
              );

              await incrementDate(paymentInterval);

              await savePayment(
                NewPaymentDate,
                paymentService.name,
                paymentMouth,
                paymentYear,
                PaymentDate
              );

              parcela++;
            }

            function incrementDate(value) {
              paymentInterval = value + interval;
            }

            async function savePayment(date, name, mes, ano, data) {
              await PagamentosServicos.create({
                orders: orderId,
                title: `${name} ${parcela + 1}/${limit}`,
                value: valorParcela,
                statusPay: "wait",
                datePay: date,
                month: meses[mes - 1],
                year: ano,
                dateToPay: data,
                planoDeConta: findPlanoContas._id,
                cliente: findOrders.client,
                accData: true,
              });
            }
          }

          if (paymentService.credito === true) {
            const unitParcela = pay.total / pay.parcelas;
            const valorParcela = parseFloat(unitParcela);

            var parcela = 0;
            const limit = pay.parcelas;
            const interval = paymentService.intervalDays;
            var paymentInterval = paymentService.intervalDays;

            while (parcela < limit) {
              const PaymentDate = new Date(dataParaSalvar);
              PaymentDate.addDias(paymentInterval);
              const paymentDay = PaymentDate.getDate();
              const paymentMouth = PaymentDate.getMonth() + 1;
              const paymentYear = PaymentDate.getFullYear();
              const NewPaymentDate = dateFns.format(
                new Date(paymentYear, paymentMouth - 1, paymentDay),
                "dd/MM/yyyy"
              );

              await incrementDate(paymentInterval);
              await savePayment(
                NewPaymentDate,
                paymentService.name,
                paymentMouth,
                paymentYear,
                PaymentDate
              );
              parcela++;
            }
            function incrementDate(value) {
              paymentInterval = value + interval;
            }
            async function savePayment(date, name, mes, ano, data) {
              await PagamentosServicos.create({
                orders: orderId,
                title: `${name} ${parcela + 1}/${limit}`,
                value: valorParcela,
                statusPay: "pay",
                datePay: date,
                month: meses[mes - 1],
                year: ano,
                dateToPay: data,
                planoDeConta: findPlanoContas._id,
                cliente: findOrders.client,
                credito: true,
              });
            }
            await OrdensServico.findByIdAndUpdate(orderId, {
              $set: { statusPay: "pay" },
            });
          }
        } else {
          await PagamentosServicos.create({
            orders: orderId,
            title: `${paymentService.name}`,
            value: pay.total,
            statusPay: "pay",
            datePay: dateFns.format(new Date(dataParaSalvar), "dd/MM/yyyy"),
            month: meses[newMonth],
            year: newYear,
            dateToPay: newDate,
            planoDeConta: findPlanoContas._id,
            cliente: findOrders.client,
          });
        }
      }
    } else {
      await payment.map((pay) => {
        const result = formasPagamento.find(
          (forma) => forma._id == pay.paymentId
        );
        CreatePaymentVista(result, pay);
      });

      async function CreatePaymentVista(payment, pay) {
        await PagamentosServicos.create({
          orders: orderId,
          title: `${payment.name}`,
          value: pay.total,
          statusPay: "pay",
          datePay: dateFns.format(new Date(dataParaSalvar), "dd/MM/yyyy"),
          month: meses[newMonth],
          year: newYear,
          dateToPay: newDate,
          planoDeConta: findPlanoContas._id,
          cliente: findOrders.client,
        });
      }

      await OrdensServico.findByIdAndUpdate(orderId, {
        $set: { statusPay: "pay" },
      });
    }

    return res
      .status(200)
      .send({ message: "Ordem de serviço concluída com sucesso" });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Ocorreu um erro ao concluir a ordem de serviço" });
  }
});

//Rota para buscar as formas de pagamento de uma venda
router.post("/findPayForm", async (req, res) => {
  const { order } = req.body;

  try {
    const pagamentos = await Pagamentos.find({ orders: order }).sort({
      dateToPay: 1,
    });

    return res.status(200).send({ pagamentos });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para buscar as formas de pagamento de uma venda
router.post("/findPayFormOrder", async (req, res) => {
  const { order } = req.body;

  try {
    const pagamentos = await PagamentosServicos.find({ orders: order }).sort({
      dateToPay: 1,
    });

    return res.status(200).send({ pagamentos });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para cancelar uma venda
router.delete("/cancelSale/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sale = await Ordens.findOne({ _id: id });

    const findComission = await Comissao.findOne({ order: id });

    const findRascNfe = await RascNfe.findOne({ sale: id });

    await sale.products.map((prod) => {
      findProducts(prod.product, prod.quantity);
    });

    async function findProducts(id, qtd) {
      const produtos = await Produtos.findOne({ _id: id });
      const estoqueAtual = produtos.estoqueAct;
      await Produtos.findByIdAndUpdate(id, {
        $set: { estoqueAct: estoqueAtual + qtd },
      });
    }

    if (findComission) {
      await Comissao.findByIdAndDelete(findComission._id);
    }

    if (findRascNfe) {
      await RascNfe.findByIdAndDelete(findRascNfe._id);
    }

    await Pagamentos.deleteMany({ orders: id });

    await Ordens.findByIdAndDelete(id);

    return res.status(200).send({ message: "Venda cancelada com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao cancelar a venda" });
  }
});

//Rota para cancelar um orçamento de vendas
router.delete("/delOrcamentSale/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Ordens.findByIdAndDelete(id);

    return res.status(200).send({ message: "Excluído com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao exclui o orçamento" });
  }
});

//Rota para cancelar um orçamento de serviços
router.delete("/delOrcamentService/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await OrdensServico.findByIdAndDelete(id);

    return res.status(200).send({ message: "Excluído com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao exclui o orçamento" });
  }
});

//Rota para cancelar uma ordem de serviço
router.delete("/cancelOrdem/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await PagamentosServicos.deleteMany({ orders: id });

    await OrdensServico.findByIdAndDelete(id);

    return res
      .status(200)
      .send({ message: "Ordem de serviço cancelada com sucesso" });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao cancelar a ordem de serviço" });
  }
});

//Rota para criar uma ordem de serviço
router.post("/createService", async (req, res) => {
  const {
    client,
    funcionario,
    equipo,
    marca,
    modelo,
    referencia,
    services,
    desconto,
    valueLiquido,
    valueBruto,
    obs,
    address,
    data,
  } = req.body;
  const clientInfo = await Clientes.findOne({ _id: client }).select("restrict");
  const findPlanoContas = await PlanodeContas.findOne({
    planoConta: "PRESTAÇÃO DE SERVIÇO",
  });
  const getNumber = await OrdensServico.find()
    .sort({ $natural: -1 })
    .limit(1)
    .select("number");

  let dateToSave = dateFns.format(new Date(data), "dd/MM/yyyy");
  let novaData = new Date(data);
  let novoMes = novaData.getMonth();
  let novoAno = novaData.getFullYear();

  try {
    let Waiting = null;
    let orderNumber;

    if (clientInfo.restrict === true) {
      Waiting = "yes";
    } else {
      Waiting = "none";
    }

    if (!getNumber.length) {
      orderNumber = 1;
    } else {
      orderNumber = getNumber[0].number + 1;
    }

    const ordem = await OrdensServico.create({
      client,
      funcionario,
      veicles,
      services,
      statuSales: "sale",
      desconto,
      valueLiquido,
      valueBruto,
      createDate: dateToSave,
      month: meses[novoMes],
      year: novoAno,
      planoDeConta: findPlanoContas._id,
      waiting: Waiting,
      obs,
      number: orderNumber,
      address,
      dateSave: dataCadastro,
      equipo,
      marca,
      modelo,
      referencia,
    });

    if (Waiting === "yes") {
      return res.status(200).send({
        message:
          "Este cliente possui restrições, esta ordem de serviço está em análise, consulte seu gerente",
        ordem,
      });
    } else {
      return res.status(200).send({ ordem });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao concluir a ordem de serviço" });
  }
});

//Rota para converter uma ordem de serviço em venda
router.put("/convertOrderToSale/:id", async (req, res) => {
  const { id } = req.params;
  const {
    client,
    services,
    products,
    desconto,
    valueLiquido,
    valueBruto,
    totalService,
    totalProduct,
    serviceLiquid,
    productLiquid,
  } = req.body;

  const clientInfo = await Clientes.findOne({ _id: client }).select("restrict");

  try {
    var Waiting = null;

    if (clientInfo.restrict === true) {
      Waiting = "yes";
    } else {
      Waiting = "none";
    }

    await OrdensServico.findByIdAndUpdate(id, {
      $set: {
        services,
        products,
        desconto,
        valueLiquido,
        valueBruto,
        totalService,
        totalProduct,
        serviceLiquid,
        productLiquid,
        waiting: Waiting,
        createDate: dataCadastro,
        month: meses[monthDate - 1],
        year: yearDate,
        dateSave: DateNow,
        statuSales: "sale",
      },
    });

    const order = await OrdensServico.findOne({ _id: id }).populate({
      path: "client funcionario mecanico veicles",
      select: "name model",
    });

    if (Waiting === "yes") {
      return res.status(200).send({
        message:
          "Este cliente possui restrições, esta ordem de serviço está em análise, consulte seu gerente",
        order,
      });
    } else {
      return res.status(200).send({ order });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao concluir a ordem de serviço" });
  }
});

//Rota para colocar uma ordem de serviço em espera
router.post("/createServiceOrca", async (req, res) => {
  const {
    client,
    funcionario,
    veicles,
    services,
    desconto,
    valueLiquido,
    valueBruto,
    obs,
    address,
  } = req.body;
  const findPlanoContas = await PlanodeContas.findOne({
    planoConta: "PRESTAÇÃO DE SERVIÇO",
  });
  const getNumber = await OrdensServico.find()
    .sort({ $natural: -1 })
    .limit(1)
    .select("number");

  try {
    let orderNumber;

    if (!getNumber.length) {
      orderNumber = 1;
    } else {
      orderNumber = getNumber[0].number + 1;
    }

    await OrdensServico.create({
      client,
      funcionario,
      veicles,
      services,
      statuSales: "orca",
      desconto,
      valueLiquido,
      valueBruto,
      createDate: dataCadastro,
      month: meses[monthDate - 1],
      year: yearDate,
      planoDeConta: findPlanoContas._id,
      waiting: "none",
      number: orderNumber,
      obs,
      address,
    });

    return res.status(200).send({ message: "Ordem salva com sucesso" });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao salvar a ordem de serviço" });
  }
});

//Salvar Ordem de Serviço em Espera
router.put("/saveOrderService/:id", async (req, res) => {
  const { id } = req.params;
  const { services, products, desconto, valueLiquido, valueBruto } = req.body;

  try {
    await OrdensServico.findByIdAndUpdate(id, {
      $set: {
        services,
        products,
        desconto,
        valueLiquido,
        valueBruto,
      },
    });

    return res.status(200).send({ message: "Ordem salva com sucesso" });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao salvar a ordem de serviço" });
  }
});

//Rota para as listagens na parte de vendas
router.get("/listsSale", async (req, res) => {
  try {
    const clients = await Clientes.find({ active: true }).sort({ name: 1 });

    const address = await Enderecos.find().populate({
      path: "client",
      select: "name",
    });

    const products = await Produtos.find({ active: true }).sort({ name: 1 });

    return res.status(200).send({ clients, address, products });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para as listagens na parte de orçamento de ordem de serviços
router.get("/listsOrcamentOrderService", async (req, res) => {
  try {
    const clients = await Clientes.find({ active: true }).sort({ name: 1 });

    const address = await Enderecos.find().populate({
      path: "client",
      select: "name",
    });

    const services = await Servicos.find({ active: true }).sort({ name: 1 });

    return res.status(200).send({ clients, address, services });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para as listagens na parte de orçamento de ordem de serviços
router.get("/listsOrderService", async (req, res) => {
  try {
    const clients = await Clientes.find({ active: true }).sort({ name: 1 });

    const address = await Enderecos.find().populate({
      path: "client",
      select: "name",
    });

    const services = await Servicos.find({ active: true }).sort({ name: 1 });

    return res.status(200).send({ clients, address, services });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar os produtos após a venda
router.get("/findAllProducts", async (req, res) => {
  try {
    const products = await Produtos.find({ active: true }).sort({
      codiname: 1,
    });

    return res.status(200).send({ products });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar as Vendas do dia
router.get("/findSales", async (req, res) => {
  try {
    const orders = await Ordens.find({
      createDate: dataCadastro,
      statuSales: "sale",
      finish: "no",
      waiting: "none",
    }).populate({
      path: "client funcionario planoDeConta address",
      select:
        "name planoConta street number bairro city state phoneComercial celOne",
    });

    return res.status(200).send({ orders });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar as Ordens de Serviços
router.get("/findOrderServices", async (req, res) => {
  try {
    const orderServices = await OrdensServico.find({
      createDate: dataCadastro,
      statuSales: "sale",
      finish: "no",
      waiting: "none",
    }).populate({
      path: "client funcionario veicles planoDeConta address",
      select:
        "name planoConta model street number bairro city state phoneComercial celOne",
    });

    return res.status(200).send({ orderServices });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar as vendas em espera
router.get("/listSaleWaiting", async (req, res) => {
  try {
    const orders = await Ordens.find({
      createDate: dataCadastro,
      statuSales: "sale",
      finish: "no",
      waiting: "yes",
    }).populate({
      path: "client funcionario planoDeConta address",
      select:
        "name planoConta street number bairro city state phoneComercial celOne",
    });

    return res.status(200).send({ orders });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar as vendas em espera por vendedor
router.get("/listSaleWaitingVend/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const orders = await Ordens.find({
      funcionario: id,
      createDate: dataCadastro,
      statuSales: "sale",
      finish: "no",
      waiting: "yes",
    }).populate({
      path: "client funcionario planoDeConta address",
      select:
        "name planoConta street number bairro city state phoneComercial celOne",
    });

    return res.status(200).send({ orders });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar as Ordens de Serviços em espera
router.get("/findOrderServices", async (req, res) => {
  try {
    const orderServices = await OrdensServico.find({
      createDate: dataCadastro,
      statuSales: "sale",
      finish: "no",
      waiting: "yes",
    }).populate({
      path: "client funcionario veicles planoDeConta address",
      select:
        "name planoConta model street number bairro city state phoneComercial celOne",
    });

    return res.status(200).send({ orderServices });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar as Ordens de Serviços em espera
router.get("/findOrderServicesVend/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const orderServices = await OrdensServico.find({
      funcionario: id,
      createDate: dataCadastro,
      statuSales: "sale",
      finish: "no",
      waiting: "yes",
    }).populate({
      path: "client funcionario veicles planoDeConta address",
      select:
        "name planoConta model street number bairro city state phoneComercial celOne",
    });

    return res.status(200).send({ orderServices });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para autenticar funcionário
router.post("/autenticate", async (req, res) => {
  const { user, password } = req.body;

  try {
    const funcionario = await Funcionario.findOne({ user: user }).select(
      "user password admin"
    );

    if (!funcionario) {
      return res.status(400).send({ message: "Usuário não encontrado" });
    }

    if (funcionario.admin !== true) {
      return res
        .status(400)
        .send({ message: "Usuário não tem permissão para esta ação" });
    }

    if (password !== funcionario.password) {
      return res.status(400).send({ message: "Senha inválida" });
    }

    return res.status(200).send({ message: "OK" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para salvar como orçamento
router.post("/createOrcamentSale", async (req, res) => {
  const {
    client,
    funcionario,
    products,
    desconto,
    valueLiquido,
    valueBruto,
    obs,
    address,
    data,
    descontoValue,
  } = req.body;
  const findPlanoContas = await PlanodeContas.findOne({
    planoConta: "VENDA DE PRODUTOS",
  });
  const produtos = await Produtos.find();
  const getNumber = await Ordens.find()
    .sort({ $natural: -1 })
    .limit(1)
    .select("number");

  let dateToSave = dateFns.format(new Date(data), "dd/MM/yyyy");
  let novaData = new Date(data);
  let novoMes = novaData.getMonth();
  let novoAno = novaData.getFullYear();

  try {
    let orderNumber;

    if (!getNumber.length) {
      orderNumber = 1;
    } else {
      orderNumber = getNumber[0].number + 1;
    }

    //** ATUALIZANDO O ESTOQUE *//

    await products.map((element) => {
      const result = produtos.find((obj) => obj._id == element.product);
      const total = result.estoqueAct - element.quantity;
      UpdateDB(element.product, total);
    });

    async function UpdateDB(id, result) {
      await Produtos.update({ _id: id }, { $set: { estoqueAct: result } });
    }

    //** FINAL DA ATUALIZAÇÃO */

    const orcamento = await Ordens.create({
      client,
      funcionario,
      products,
      statuSales: "orca",
      desconto,
      valueLiquido,
      valueBruto,
      createDate: dateToSave,
      month: meses[novoMes],
      year: novoAno,
      waiting: "none",
      planoDeConta: findPlanoContas._id,
      number: orderNumber,
      obs,
      address,
      valueDesconto: descontoValue,
      dateSave: novaData,
    });

    return res.status(200).send({ orcamento });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao concluir a venda" });
  }
});

//Converter em venda
router.put("/convertToSale/:id", async (req, res) => {
  const { id } = req.params;
  const { valueBruto, valueLiquido, desconto } = req.body;

  try {
    await Ordens.findByIdAndUpdate(id, {
      $set: {
        valueBruto,
        valueLiquido,
        desconto,
        statuSales: "sale",
      },
    });

    const order = await Ordens.findOne({ _id: id });

    return res.status(200).send({ order });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao concluir a venda" });
  }
});

//Rota para converter vários orçamentos em vendas
router.put("/convertManyToSale", async (req, res) => {
  const {
    ids,
    client,
    funcionario,
    products,
    desconto,
    valueLiquido,
    valueBruto,
    obs,
    address,
  } = req.body;
  const findPlanoContas = await PlanodeContas.findOne({
    planoConta: "VENDA DE PRODUTOS",
  });
  const getNumber = await Ordens.find()
    .sort({ $natural: -1 })
    .limit(1)
    .select("number");

  try {
    let orderNumber;

    if (!getNumber.length) {
      orderNumber = 1;
    } else {
      orderNumber = getNumber[0].number + 1;
    }

    await ids.map((id) => {
      delOrcaments(id);
    });

    async function delOrcaments(id) {
      await Ordens.findByIdAndRemove(id);
    }

    const ordem = await Ordens.create({
      client,
      funcionario,
      products,
      statuSales: "sale",
      desconto,
      valueLiquido,
      valueBruto,
      createDate: dataCadastro,
      month: meses[monthDate - 1],
      year: yearDate,
      waiting: "none",
      planoDeConta: findPlanoContas._id,
      number: orderNumber,
      obs,
      address,
      dateSave: DateNow,
    });

    return res.status(200).send({ ordem });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao concluir a ação" });
  }
});

//Rota para buscar orçamentos
router.post("/findOrcaments", async (req, res) => {
  const { type, funcionario, cliente, data, mes, ano, numberSale } = req.body;

  try {
    const address = await Enderecos.find().populate({
      path: "client",
      select: "name",
    });

    if (type === 1) {
      const order = await Ordens.find({
        funcionario: funcionario,
        statuSales: "orca",
      })
        .sort({ dateSave: 1 })
        .populate({
          path: "client address",
          select: "name street number city state celOne phoneComercial",
        });

      return res.status(200).send({ order, address });
    }

    if (type === 2) {
      const order = await Ordens.find({ client: cliente, statuSales: "orca" })
        .sort({ dateSave: 1 })
        .populate({
          path: "client address",
          select: "name street number city state celOne phoneComercial",
        });

      return res.status(200).send({ order, address });
    }

    if (type === 3) {
      const order = await Ordens.find({ createDate: data, statuSales: "orca" })
        .sort({ dateSave: 1 })
        .populate({
          path: "client address",
          select: "name street number city state celOne phoneComercial",
        });

      return res.status(200).send({ order, address });
    }

    if (type === 4) {
      const order = await Ordens.find({
        month: mes,
        year: ano,
        statuSales: "orca",
      })
        .sort({ dateSave: 1 })
        .populate({
          path: "client address",
          select: "name street number city state celOne phoneComercial",
        });

      return res.status(200).send({ order, address });
    }

    if (type === 5) {
      const order = await Ordens.find({
        number: numberSale,
        statuSales: "orca",
      })
        .sort({ dateSave: 1 })
        .populate({
          path: "client address",
          select: "name street number city state celOne phoneComercial",
        });

      return res.status(200).send({ order, address });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar os orçamentos" });
  }
});

//Rota para buscar orçamentos Ordem de Serviço
router.post("/findOrcamentsOrders", async (req, res) => {
  const { type, funcionario, cliente, data, mes, ano } = req.body;

  try {
    if (type === 1) {
      const order = await OrdensServico.find({
        funcionario: funcionario,
        statuSales: "orca",
      })
        .sort({ dateSave: 1 })
        .populate({
          path: "client veicles address",
          select: "name model street number city state celOne phoneComercial",
        });

      return res.status(200).send({ order });
    }

    if (type === 2) {
      const order = await OrdensServico.find({
        client: cliente,
        statuSales: "orca",
      })
        .sort({ dateSave: 1 })
        .populate({
          path: "client veicles",
          select: "name model street number city state celOne phoneComercial",
        });

      return res.status(200).send({ order });
    }

    if (type === 3) {
      const order = await OrdensServico.find({
        createDate: data,
        statuSales: "orca",
      })
        .sort({ dateSave: 1 })
        .populate({
          path: "client veicles",
          select: "name model street number city state celOne phoneComercial",
        });

      return res.status(200).send({ order });
    }

    if (type === 4) {
      const order = await OrdensServico.find({
        month: mes,
        year: ano,
        statuSales: "orca",
      })
        .sort({ dateSave: 1 })
        .populate({
          path: "client veicles",
          select: "name model street number city state celOne phoneComercial",
        });

      return res.status(200).send({ order });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao buscar as ordens de Serviço" });
  }
});

//Rota para excluir ordem em espera
router.delete("/delOrderSale/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await OrdensServico.findByIdAndDelete(id);

    return res.status(200).send({ message: "Excluído com sucesso" });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao excluir as ordens de Serviço" });
  }
});

//Buscar clientes
router.get("/findClientes", async (req, res) => {
  try {
    const clients = await Clientes.find().sort({ name: 1 });

    return res.status(200).send({ clients });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar os clientes" });
  }
});

//Rota para buscar os endereços
router.get("/findAllAddress", async (req, res) => {
  try {
    const address = await Enderecos.find().populate({
      path: "client",
      select: "name",
    });
    return res.status(200).send({ address });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar os endereços" });
  }
});

//Rota para listar as vendas em espera
router.post("/listSalesWaiting", async (req, res) => {
  const { func } = req.body;

  try {
    const sales = await Ordens.find({ waiting: "yes", funcionario: func })
      .sort({ dateSave: 1 })
      .populate({
        path: "client funcionario address",
        select: "name street number bairro city state phoneComercial celOne",
      });

    return res.status(200).send({ sales });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar as ordens de serviço em espera
router.post("/listOrdersWaiting", async (req, res) => {
  const { func } = req.body;

  try {
    const sales = await OrdensServico.find({
      waiting: "yes",
      funcionario: func,
    })
      .sort({ dateSave: 1 })
      .populate({
        path: "client funcionario veicles address",
        select:
          "name model street number bairro city state phoneComercial celOne",
      });

    return res.status(200).send({ sales });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota par alterar o status da ordem de serviço (admin)
router.put("/changeStatusOrdensWaiting/:id", async (req, res) => {
  const { id } = req.params;
  const { statuSale } = req.body;

  try {
    await OrdensServico.findByIdAndUpdate(id, { $set: { waiting: statuSale } });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota par alterar o status da venda (admin)
router.put("/changeStatusSalesWaiting/:id", async (req, res) => {
  const { id } = req.params;
  const { statuSale } = req.body;

  try {
    await Ordens.findByIdAndUpdate(id, { $set: { waiting: statuSale } });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para buscar o status da venda
router.post("/findStatusSale", async (req, res) => {
  const { idOrder } = req.body;

  try {
    const sale = await Ordens.findOne({ _id: idOrder }).select("waiting");

    return res.status(200).send({ sale });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para buscar o status da ordem de serviço
router.post("/findStatusOrder", async (req, res) => {
  const { idOrder } = req.body;

  try {
    const sale = await OrdensServico.findOne({ _id: idOrder }).select(
      "waiting"
    );

    return res.status(200).send({ sale });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para buscar Vendas por id
router.get("/findSaleById/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sale = await Ordens.find({ _id: id }).populate({
      path: "client funcionario",
      select: "name",
    });

    return res.status(200).send({ sale });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para buscar a Ordem de servico por id
router.get("/findOrderById/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await OrdensServico.find({ _id: id }).populate({
      path: "client funcionario mecanico veicles",
      select: "name model",
    });

    return res.status(200).send({ order });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para adicionar mais produtos as vendas
router.put("/addProductsToSale/:id", async (req, res) => {
  const { id } = req.params;
  const { desconto, valueLiquido, valueBruto, products } = req.body;
  try {
    await Ordens.findOneAndUpdate(id, {
      $set: { desconto, valueLiquido, valueBruto, products },
    });
    return res.status(200).send({ message: "Venda salva com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao salvar a venda" });
  }
});

module.exports = (app) => app.use("/orders", router);
