const express = require("express");
const router = express.Router();
const Vendas = require("../models/ordens");
const OrdernServicos = require("../models/ordenServico");
const Servicos = require("../models/servicos");
const Produtos = require("../models/produtos");
const Funcionarios = require("../models/funcionarios");
const Fornecedores = require("../models/fornecedores");
const Clientes = require("../models/clientes");
const PlanoContas = require("../models/planoDeContas");
const ContasReceber = require("../models/contasReceber");
const ContasPagar = require("../models/contasPagar");
const PagamentoServicos = require("../models/pagamentosServicos");
const PagamentoProdutos = require("../models/pagamentosVendas");
const Balancete = require("../models/balancete");
const shortId = require("shortid");
const dateFns = require("date-fns");
const DateNow = new Date();
const dayDate = DateNow.getDate();
const monthDate = DateNow.getMonth() + 1;
const yearDate = DateNow.getFullYear();
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

//Rota para listar as vendas (Com Busca)
router.post("/listSales", async (req, res) => {
  const { find, client, func, mes, ano } = req.body;

  try {
    if (find === 1) {
      //Mês Atual todas
      const salesPay = await Vendas.find({
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });
      const salesWait = await Vendas.find({
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });

      var valuesPay = salesPay.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcPay = valuesPay.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      var valuesWait = salesWait.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcWait = valuesWait.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      return res.status(200).send({ salesPay, salesWait, calcPay, calcWait });
    }

    if (find === 2) {
      //Período todas
      const salesPay = await Vendas.find({
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });
      const salesWait = await Vendas.find({
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });

      var valuesPay = salesPay.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcPay = valuesPay.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      var valuesWait = salesWait.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcWait = valuesWait.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      return res.status(200).send({ salesPay, salesWait, calcPay, calcWait });
    }
    if (find === 3) {
      //Ano todas
      const salesPay = await Vendas.find({
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });
      const salesWait = await Vendas.find({
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });

      var valuesPay = salesPay.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcPay = valuesPay.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      var valuesWait = salesWait.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcWait = valuesWait.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      return res.status(200).send({ salesPay, salesWait, calcPay, calcWait });
    }

    if (find === 4) {
      //Por Cliente mês atual todas as vendas
      const salesPay = await Vendas.find({
        client: client,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });
      const salesWait = await Vendas.find({
        client: client,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });

      var valuesPay = salesPay.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcPay = valuesPay.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      var valuesWait = salesWait.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcWait = valuesWait.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      return res.status(200).send({ salesPay, salesWait, calcPay, calcWait });
    }
    if (find === 5) {
      //Por Cliente e período todas as vendas
      const salesPay = await Vendas.find({
        client: client,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });
      const salesWait = await Vendas.find({
        client: client,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });

      var valuesPay = salesPay.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcPay = valuesPay.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      var valuesWait = salesWait.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcWait = valuesWait.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      return res.status(200).send({ salesPay, salesWait, calcPay, calcWait });
    }
    if (find === 6) {
      //Por Cliente e ano todas as vendas
      const salesPay = await Vendas.find({
        client: client,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });
      const salesWait = await Vendas.find({
        client: client,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });

      var valuesPay = salesPay.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcPay = valuesPay.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      var valuesWait = salesWait.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcWait = valuesWait.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      return res.status(200).send({ salesPay, salesWait, calcPay, calcWait });
    }

    if (find === 7) {
      //Por Vendedor mes atual todas as vendas
      const salesPay = await Vendas.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });
      const salesWait = await Vendas.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });

      var valuesPay = salesPay.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcPay = valuesPay.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      var valuesWait = salesWait.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcWait = valuesWait.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      return res.status(200).send({ salesPay, salesWait, calcPay, calcWait });
    }
    if (find === 8) {
      //Por Vendedor e período todas as vendas
      const salesPay = await Vendas.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });
      const salesWait = await Vendas.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });

      var valuesPay = salesPay.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcPay = valuesPay.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      var valuesWait = salesWait.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcWait = valuesWait.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      return res.status(200).send({ salesPay, salesWait, calcPay, calcWait });
    }
    if (find === 9) {
      //Por Vendedor e ano todas as vendas
      const salesPay = await Vendas.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });
      const salesWait = await Vendas.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client",
        select: "name planoConta",
      });

      var valuesPay = salesPay.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcPay = valuesPay.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      var valuesWait = salesWait.filter((vendas) => {
        return vendas.valueLiquido;
      });

      var calcWait = valuesWait.reduce((sum, vendas) => {
        return sum + vendas.valueLiquido;
      }, 0);

      return res.status(200).send({ salesPay, salesWait, calcPay, calcWait });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar as ordens de serviço (Com Busca)
router.post("/listServicesOrders", async (req, res) => {
  const { find, client, func, mes, ano } = req.body;

  try {
    if (find === 1) {
      //Mês Atual todas
      const servicesPay = await OrdernServicos.find({
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });
      const servicesWait = await OrdernServicos.find({
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });

      var valuesPay = servicesPay.filter((services) => {
        return services.serviceLiquid;
      });

      var calcPay = valuesPay.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      var valuesWait = servicesWait.filter((services) => {
        return services.serviceLiquid;
      });

      var calcWait = valuesWait.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      return res
        .status(200)
        .send({ servicesPay, servicesWait, calcPay, calcWait });
    }
    if (find === 2) {
      //Período todas
      const servicesPay = await OrdernServicos.find({
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });
      const servicesWait = await OrdernServicos.find({
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });

      var valuesPay = servicesPay.filter((services) => {
        return services.serviceLiquid;
      });

      var calcPay = valuesPay.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      var valuesWait = servicesWait.filter((services) => {
        return services.serviceLiquid;
      });

      var calcWait = valuesWait.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      return res
        .status(200)
        .send({ servicesPay, servicesWait, calcPay, calcWait });
    }
    if (find === 3) {
      //Ano todas
      const servicesPay = await OrdernServicos.find({
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });
      const servicesWait = await OrdernServicos.find({
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });

      var valuesPay = servicesPay.filter((services) => {
        return services.serviceLiquid;
      });

      var calcPay = valuesPay.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      var valuesWait = servicesWait.filter((services) => {
        return services.serviceLiquid;
      });

      var calcWait = valuesWait.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      return res
        .status(200)
        .send({ servicesPay, servicesWait, calcPay, calcWait });
    }

    if (find === 4) {
      //Cliente todas mes atual
      const servicesPay = await OrdernServicos.find({
        client: client,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });
      const servicesWait = await OrdernServicos.find({
        client: client,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });

      var valuesPay = servicesPay.filter((services) => {
        return services.serviceLiquid;
      });

      var calcPay = valuesPay.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      var valuesWait = servicesWait.filter((services) => {
        return services.serviceLiquid;
      });

      var calcWait = valuesWait.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      return res
        .status(200)
        .send({ servicesPay, servicesWait, calcPay, calcWait });
    }

    if (find === 5) {
      //Cliente todas período
      const servicesPay = await OrdernServicos.find({
        client: client,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });
      const servicesWait = await OrdernServicos.find({
        client: client,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });

      var valuesPay = servicesPay.filter((services) => {
        return services.serviceLiquid;
      });

      var calcPay = valuesPay.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      var valuesWait = servicesWait.filter((services) => {
        return services.serviceLiquid;
      });

      var calcWait = valuesWait.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      return res
        .status(200)
        .send({ servicesPay, servicesWait, calcPay, calcWait });
    }
    if (find === 6) {
      //Cliente todas ano
      const servicesPay = await OrdernServicos.find({
        client: client,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });
      const servicesWait = await OrdernServicos.find({
        client: client,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });

      var valuesPay = servicesPay.filter((services) => {
        return services.serviceLiquid;
      });

      var calcPay = valuesPay.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      var valuesWait = servicesWait.filter((services) => {
        return services.serviceLiquid;
      });

      var calcWait = valuesWait.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      return res
        .status(200)
        .send({ servicesPay, servicesWait, calcPay, calcWait });
    }

    if (find === 7) {
      //Vendedor mes atual todas
      const servicesPay = await OrdernServicos.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });
      const servicesWait = await OrdernServicos.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate - 1],
        year: yearDate,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });

      var valuesPay = servicesPay.filter((services) => {
        return services.serviceLiquid;
      });

      var calcPay = valuesPay.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      var valuesWait = servicesWait.filter((services) => {
        return services.serviceLiquid;
      });

      var calcWait = valuesWait.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      return res
        .status(200)
        .send({ servicesPay, servicesWait, calcPay, calcWait });
    }
    if (find === 8) {
      //Vendedor período todas
      const servicesPay = await OrdernServicos.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });
      const servicesWait = await OrdernServicos.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });

      var valuesPay = servicesPay.filter((services) => {
        return services.serviceLiquid;
      });

      var calcPay = valuesPay.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      var valuesWait = servicesWait.filter((services) => {
        return services.serviceLiquid;
      });

      var calcWait = valuesWait.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      return res
        .status(200)
        .send({ servicesPay, servicesWait, calcPay, calcWait });
    }
    if (find === 9) {
      //Vendedor ano todas
      const servicesPay = await OrdernServicos.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "pay",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });
      const servicesWait = await OrdernServicos.find({
        funcionario: func,
        statuSales: "sale",
        statusPay: "wait",
        waiting: "none",
        finish: "yes",
        year: ano,
      }).populate({
        path: "planoDeConta funcionario client mecanico veicles",
        select: "name planoConta model",
      });

      var valuesPay = servicesPay.filter((services) => {
        return services.serviceLiquid;
      });

      var calcPay = valuesPay.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      var valuesWait = servicesWait.filter((services) => {
        return services.serviceLiquid;
      });

      var calcWait = valuesWait.reduce((sum, services) => {
        return sum + services.serviceLiquid;
      }, 0);

      return res
        .status(200)
        .send({ servicesPay, servicesWait, calcPay, calcWait });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar os Clientes (Com as contagens dos clientes ativos, bloqueados e restritos)
router.post("/listClients", async (req, res) => {
  const { find } = req.body;

  try {
    if (find === 1) {
      const clients = await Clientes.find({ active: true }).sort({ name: 1 });
      const totalActive = await Clientes.find({ active: true }).count();
      const totalBlock = await Clientes.find({ active: false }).count();
      const totalRestrict = await Clientes.find({ restrict: true }).count();
      const totalClients = await Clientes.find().count();
      return res.status(200).send({
        clients,
        totalActive,
        totalBlock,
        totalRestrict,
        totalClients,
      });
    }
    if (find === 2) {
      const clients = await Clientes.find({ active: false }).sort({ name: 1 });
      const totalActive = await Clientes.find({ active: true }).count();
      const totalBlock = await Clientes.find({ active: false }).count();
      const totalRestrict = await Clientes.find({ restrict: true }).count();
      const totalClients = await Clientes.find().count();
      return res.status(200).send({
        clients,
        totalActive,
        totalBlock,
        totalRestrict,
        totalClients,
      });
    }
    if (find === 3) {
      const clients = await Clientes.find({ restrict: true }).sort({ name: 1 });
      const totalActive = await Clientes.find({ active: true }).count();
      const totalBlock = await Clientes.find({ active: false }).count();
      const totalRestrict = await Clientes.find({ restrict: true }).count();
      const totalClients = await Clientes.find().count();
      return res.status(200).send({
        clients,
        totalActive,
        totalBlock,
        totalRestrict,
        totalClients,
      });
    }
    if (find === 4) {
      const clients = await Clientes.find().sort({ name: 1 });
      const totalActive = await Clientes.find({ active: true }).count();
      const totalBlock = await Clientes.find({ active: false }).count();
      const totalRestrict = await Clientes.find({ restrict: true }).count();
      const totalClients = await Clientes.find().count();
      return res.status(200).send({
        clients,
        totalActive,
        totalBlock,
        totalRestrict,
        totalClients,
      });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar os funcionarios (Com contagem dos ativos e bloqueados)
router.post("/listFunc", async (req, res) => {
  const { find } = req.body;

  try {
    if (find === 1) {
      const funcs = await Funcionarios.find({ active: true }).sort({ name: 1 });
      const totalActive = await Funcionarios.find({ active: true }).count();
      const totalBlock = await Funcionarios.find({ active: false }).count();
      const totalFuncs = await Funcionarios.find().count();
      return res
        .status(200)
        .send({ funcs, totalActive, totalBlock, totalFuncs });
    }
    if (find === 2) {
      const funcs = await Funcionarios.find({ active: false }).sort({
        name: 1,
      });
      const totalActive = await Funcionarios.find({ active: true }).count();
      const totalBlock = await Funcionarios.find({ active: false }).count();
      const totalFuncs = await Funcionarios.find().count();
      return res
        .status(200)
        .send({ funcs, totalActive, totalBlock, totalFuncs });
    }
    if (find === 3) {
      const funcs = await Funcionarios.find().sort({ name: 1 });
      const totalActive = await Funcionarios.find({ active: true }).count();
      const totalBlock = await Funcionarios.find({ active: false }).count();
      const totalFuncs = await Funcionarios.find().count();
      return res
        .status(200)
        .send({ funcs, totalActive, totalBlock, totalFuncs });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar os fornecedores
router.get("/listFornecers", async (req, res) => {
  try {
    const fornecers = await Fornecedores.find().sort({ name: 1 });
    const fornecersCount = await Fornecedores.find().count();

    return res.status(200).send({ fornecers, fornecersCount });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});
//Rota para listar Estoque (com busca) produtos
router.post("/listProducts", async (req, res) => {
  const { find } = req.body;

  try {
    if (find === 1) {
      const products = await Produtos.find({ active: true })
        .sort({ name: 1 })
        .populate({ path: "fornecedor", select: "name" });
      const totalActive = await Produtos.find({ active: true }).count();
      const totalBlock = await Produtos.find({ active: false }).count();
      const totalProducts = await Produtos.find().count();
      return res
        .status(200)
        .send({ products, totalActive, totalBlock, totalProducts });
    }
    if (find === 2) {
      const products = await Produtos.find({ active: false })
        .sort({ name: 1 })
        .populate({ path: "fornecedor", select: "name" });
      const totalActive = await Produtos.find({ active: true }).count();
      const totalBlock = await Produtos.find({ active: false }).count();
      const totalProducts = await Produtos.find().count();
      return res
        .status(200)
        .send({ products, totalActive, totalBlock, totalProducts });
    }
    if (find === 3) {
      const products = await Produtos.find({ estoqueAct: { $lte: 5 } })
        .sort({ name: 1 })
        .populate({ path: "fornecedor", select: "name" });
      const totalActive = await Produtos.find({ active: true }).count();
      const totalBlock = await Produtos.find({ active: false }).count();
      const totalProducts = await Produtos.find().count();
      return res
        .status(200)
        .send({ products, totalActive, totalBlock, totalProducts });
    }
    if (find === 4) {
      const products = await Produtos.find()
        .sort({ name: 1 })
        .populate({ path: "fornecedor", select: "name" });
      const totalActive = await Produtos.find({ active: true }).count();
      const totalBlock = await Produtos.find({ active: false }).count();
      const totalProducts = await Produtos.find().count();
      return res
        .status(200)
        .send({ products, totalActive, totalBlock, totalProducts });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para criar relatório de serviços (com busca)
router.post("/listServices", async (req, res) => {
  const { find } = req.body;

  try {
    if (find === 1) {
      const services = await Servicos.find({ active: true }).sort({ name: 1 });
      const totalActive = await Servicos.find({ active: true }).count();
      const totalBlock = await Servicos.find({ active: false }).count();
      const totalServices = await Servicos.find().count();
      return res
        .status(200)
        .send({ services, totalActive, totalBlock, totalServices });
    }
    if (find === 2) {
      const services = await Servicos.find({ active: false }).sort({ name: 1 });
      const totalActive = await Servicos.find({ active: true }).count();
      const totalBlock = await Servicos.find({ active: false }).count();
      const totalServices = await Servicos.find().count();
      return res
        .status(200)
        .send({ services, totalActive, totalBlock, totalServices });
    }
    if (find === 3) {
      const services = await Servicos.find().sort({ name: 1 });
      const totalActive = await Servicos.find({ active: true }).count();
      const totalBlock = await Servicos.find({ active: false }).count();
      const totalServices = await Servicos.find().count();
      return res
        .status(200)
        .send({ services, totalActive, totalBlock, totalServices });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para criar o relatório financeiro
router.post("/createBalancete", async (req, res) => {
  const { mes, ano, useSaldo } = req.body;

  const dataCadastro = dateFns.format(
    new Date(yearDate, monthDate - 1, dayDate),
    "dd/MM/yyyy"
  );

  try {
    const findDuplicate = await Balancete.findOne({ month: mes, year: ano });

    if (findDuplicate) {
      return res
        .status(400)
        .send({ message: "O balancete para este mês já foi gerado" });
    }

    var Deposits = new Array();
    var WithDraws = new Array();

    //CALCULO DAS VENDAS DE PRODUTOS

    const paymentProducts = await PagamentoProdutos.find({
      month: mes,
      year: ano,
      statusPay: "pay",
    }).select("value");

    var valueProductSale = paymentProducts.filter((products) => {
      return products.value;
    });

    var calcProductSale = valueProductSale.reduce((sum, products) => {
      return sum + products.value;
    }, 0);

    const resultadoProdutos = await parseFloat(calcProductSale.toFixed(2));

    await Deposits.push({
      id: shortId.generate(),
      description: "Venda de Produtos",
      value: resultadoProdutos,
    });

    //CÁLCULO DAS PRESTAÇÕES DE SERVIÇOS

    const paymentServices = await PagamentoServicos.find({
      month: mes,
      year: ano,
      statusPay: "pay",
    }).select("valueServices");

    var valueServices = paymentServices.filter((services) => {
      return services.valueServices;
    });

    var calcServices = valueServices.reduce((sum, services) => {
      return sum + services.valueServices;
    }, 0);

    const calculoServicos = parseFloat(calcServices);
    const resultadoServicos = parseFloat(calculoServicos.toFixed(2));

    await Deposits.push({
      id: shortId.generate(),
      description: "Prestação de Serviços",
      value: resultadoServicos,
    });

    //CÁLCULO DAS RECEITAS

    const planoContas = await PlanoContas.find({ typeMoviment: "credit" });
    const contasReceber = await ContasReceber.find({
      month: mes,
      year: ano,
      statusPay: "pay",
    }).populate({ path: "planContas", select: "planoConta" });

    await planoContas.map((plano) => {
      const result = contasReceber.filter((conta) => {
        return conta.planContas.planoConta === plano.planoConta;
      });

      var valueReceives = result.filter((services) => {
        return services.value;
      });

      var calcReceives = valueReceives.reduce((sum, services) => {
        return sum + services.value;
      }, 0);

      if (calcReceives > 0)
        Deposits.push({
          id: shortId.generate(),
          description: plano.planoConta,
          value: calcReceives,
        });
    });

    //CÁLCULO DAS DESPESAS
    const planoContasTwo = await PlanoContas.find({ typeMoviment: "debit" });
    const contasPagar = await ContasPagar.find({
      month: mes,
      year: ano,
      statusPay: "pay",
    }).populate({ path: "planContas", select: "planoConta" });

    await planoContasTwo.map((plano) => {
      const result = contasPagar.filter((conta) => {
        return conta.planContas.planoConta === plano.planoConta;
      });

      var valueExpenses = result.filter((services) => {
        return services.value;
      });

      var calcExpenses = valueExpenses.reduce((sum, services) => {
        return sum + services.value;
      }, 0);

      if (calcExpenses > 0)
        WithDraws.push({
          id: shortId.generate(),
          description: plano.planoConta,
          value: calcExpenses,
        });
    });

    const getSaldoAnterior = await Balancete.find()
      .sort({ $natural: -1 })
      .limit(1);

    var saldoAnterior;

    if (useSaldo === true) {
      if (!getSaldoAnterior.length) {
        saldoAnterior = 0;
      } else {
        saldoAnterior = getSaldoAnterior[0].saldoAtual;
      }
    } else {
      saldoAnterior = 0;
    }

    var totalEntradas = Deposits.filter((services) => {
      return services.value;
    });

    var calcTotalEntradas = totalEntradas.reduce((sum, services) => {
      return sum + services.value;
    }, 0);

    var totalSaidas = WithDraws.filter((services) => {
      return services.value;
    });

    var calcTotalSaidas = totalSaidas.reduce((sum, services) => {
      return sum + services.value;
    }, 0);

    const totalReceitas = calcTotalEntradas + saldoAnterior;
    const totalDespesas = calcTotalSaidas;
    const saldoMensal = totalReceitas - totalDespesas;

    const relatorioMensal = await Balancete.create({
      month: mes,
      year: ano,
      title: `Relatório referente ao mês de: ${mes}`,
      receives: Deposits,
      withdraw: WithDraws,
      saldoAnterior: saldoAnterior,
      entradas: totalReceitas,
      saidas: totalDespesas,
      saldoAtual: saldoMensal,
      dataFechamento: dataCadastro,
      dateSave: DateNow,
    });

    return res.status(200).send({ relatorioMensal });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao fechar o balancete" });
  }
});

//Rota para criar o relatório financeiro anual
router.post("/createBalanceteAnual", async (req, res) => {
  const { ano } = req.body;

  const dataCadastro = dateFns.format(
    new Date(yearDate, monthDate - 1, dayDate),
    "dd/MM/yyyy"
  );

  try {
    const findDuplicate = await Balancete.findOne({ anual: true, year: ano });

    if (findDuplicate) {
      return res
        .status(400)
        .send({ message: "O balancete para este ano já foi gerado" });
    }

    var Deposits = new Array();
    var WithDraws = new Array();

    //CALCULO DAS VENDAS DE PRODUTOS

    const paymentProducts = await PagamentoProdutos.find({
      year: ano,
      statusPay: "pay",
    }).select("value");

    var valueProductSale = paymentProducts.filter((products) => {
      return products.value;
    });

    var calcProductSale = valueProductSale.reduce((sum, products) => {
      return sum + products.value;
    }, 0);

    const resultadoProdutos = await parseFloat(calcProductSale.toFixed(2));

    await Deposits.push({
      id: shortId.generate(),
      description: "Venda de Produtos",
      value: resultadoProdutos,
    });

    //CÁLCULO DAS PRESTAÇÕES DE SERVIÇOS

    const paymentServices = await PagamentoServicos.find({
      year: ano,
      statusPay: "pay",
    }).select("valueServices");

    var valueServices = paymentServices.filter((services) => {
      return services.valueServices;
    });

    var calcServices = valueServices.reduce((sum, services) => {
      return sum + services.valueServices;
    }, 0);

    const calculoServicos = parseFloat(calcServices);
    const resultadoServicos = parseFloat(calculoServicos.toFixed(2));

    await Deposits.push({
      id: shortId.generate(),
      description: "Prestação de Serviços",
      value: resultadoServicos,
    });

    //CÁLCULO DAS RECEITAS

    const planoContas = await PlanoContas.find({ typeMoviment: "credit" });
    const contasReceber = await ContasReceber.find({
      year: ano,
      statusPay: "pay",
    }).populate({ path: "planContas", select: "planoConta" });

    await planoContas.map((plano) => {
      const result = contasReceber.filter((conta) => {
        return conta.planContas.planoConta === plano.planoConta;
      });

      var valueReceives = result.filter((services) => {
        return services.value;
      });

      var calcReceives = valueReceives.reduce((sum, services) => {
        return sum + services.value;
      }, 0);

      if (calcReceives > 0)
        Deposits.push({
          id: shortId.generate(),
          description: plano.planoConta,
          value: calcReceives,
        });
    });

    //CÁLCULO DAS DESPESAS
    const planoContasTwo = await PlanoContas.find({ typeMoviment: "debit" });
    const contasPagar = await ContasPagar.find({
      year: ano,
      statusPay: "pay",
    }).populate({ path: "planContas", select: "planoConta" });

    await planoContasTwo.map((plano) => {
      const result = contasPagar.filter((conta) => {
        return conta.planContas.planoConta === plano.planoConta;
      });

      var valueExpenses = result.filter((services) => {
        return services.value;
      });

      var calcExpenses = valueExpenses.reduce((sum, services) => {
        return sum + services.value;
      }, 0);

      if (calcExpenses > 0)
        WithDraws.push({
          id: shortId.generate(),
          description: plano.planoConta,
          value: calcExpenses,
        });
    });

    const getSaldoAnterior = await Balancete.find({ anual: true })
      .sort({ $natural: -1 })
      .limit(1);

    var saldoAnterior;

    if (!getSaldoAnterior.length) {
      saldoAnterior = 0;
    } else {
      saldoAnterior = getSaldoAnterior[0].saldoAtual;
    }

    var totalEntradas = Deposits.filter((services) => {
      return services.value;
    });

    var calcTotalEntradas = totalEntradas.reduce((sum, services) => {
      return sum + services.value;
    }, 0);

    var totalSaidas = WithDraws.filter((services) => {
      return services.value;
    });

    var calcTotalSaidas = totalSaidas.reduce((sum, services) => {
      return sum + services.value;
    }, 0);

    const totalReceitas = calcTotalEntradas + saldoAnterior;
    const totalDespesas = calcTotalSaidas;
    const saldoMensal = totalReceitas - totalDespesas;

    const relatorioMensal = await Balancete.create({
      month: meses[monthDate - 1],
      year: ano,
      title: `Relatório referente ao ano de: ${ano}`,
      receives: Deposits,
      withdraw: WithDraws,
      saldoAnterior: saldoAnterior,
      entradas: totalReceitas,
      saidas: totalDespesas,
      saldoAtual: saldoMensal,
      dataFechamento: dataCadastro,
      dateSave: DateNow,
      anual: true,
    });

    return res.status(200).send({ relatorioMensal });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao fechar o balancete" });
  }
});

//Relatório do movimento de caixa
router.post("/fluxCashier", async (req, res) => {
  const { find, mes, ano } = req.body;

  try {
    //BUSCAR DO MÊS ATUAL
    if (find === 1) {
      const products = await PagamentoProdutos.find({
        month: meses[monthDate - 1],
        year: yearDate,
        statusPay: "pay",
      })
        .populate({ path: "cliente", select: "name" })
        .sort({ $natural: 1 });

      const services = await PagamentoServicos.find({
        month: meses[monthDate - 1],
        year: yearDate,
        statusPay: "pay",
      })
        .populate({ path: "cliente", select: "name" })
        .sort({ $natural: 1 });

      const receitas = await ContasReceber.find({
        month: meses[monthDate - 1],
        year: yearDate,
        statusPay: "pay",
      })
        .populate({
          path: "planContas payForm accountBank",
          select: "planoConta name bank",
        })
        .sort({ dateSave: 1 });

      const despesas = await ContasPagar.find({
        month: meses[monthDate - 1],
        year: yearDate,
        statusPay: "pay",
      })
        .populate({
          path: "planContas payForm accountBank",
          select: "planoConta name bank",
        })
        .sort({ dateSave: 1 });

      //** TOTAL DAS VENDAS DE PRODUTOS */

      var totalProductSale = products.filter((verify) => {
        return verify.value;
      });

      var calcTotalProductSale = totalProductSale.reduce((sum, verify) => {
        return sum + verify.value;
      }, 0);

      //** TOTAL DOS SERVIÇOS */

      var totalServices = services.filter((verify) => {
        return verify.valueServices;
      });

      var calcTotalServices = totalServices.reduce((sum, verify) => {
        return sum + verify.valueServices;
      }, 0);

      //** TOTAL DAS RECEITAS */

      var totalReceitas = receitas.filter((verify) => {
        return verify.value;
      });

      var calcTotalReceitas = totalReceitas.reduce((sum, verify) => {
        return sum + verify.value;
      }, 0);

      //** TOTAL DAS DESPESAS */

      var totalDespesas = despesas.filter((verify) => {
        return verify.value;
      });

      var calcTotalDespesas = totalDespesas.reduce((sum, verify) => {
        return sum + verify.value;
      }, 0);

      return res.status(200).send({
        products,
        calcTotalProductSale,
        services,
        calcTotalServices,
        receitas,
        calcTotalReceitas,
        despesas,
        calcTotalDespesas,
      });
    }

    //BUSCA POR PERÍODO

    if (find === 2) {
      const products = await PagamentoProdutos.find({
        month: mes,
        year: ano,
        statusPay: "pay",
      })
        .populate({ path: "cliente", select: "name" })
        .sort({ $natural: 1 });

      const services = await PagamentoServicos.find({
        month: mes,
        year: ano,
        statusPay: "pay",
      })
        .populate({ path: "cliente", select: "name" })
        .sort({ $natural: 1 });

      const receitas = await ContasReceber.find({
        month: mes,
        year: ano,
        statusPay: "pay",
      })
        .populate({
          path: "planContas payForm accountBank",
          select: "planoConta name bank",
        })
        .sort({ dateSave: 1 });

      const despesas = await ContasPagar.find({
        month: mes,
        year: ano,
        statusPay: "pay",
      })
        .populate({
          path: "planContas payForm accountBank",
          select: "planoConta name bank",
        })
        .sort({ dateSave: 1 });

      //** TOTAL DAS VENDAS DE PRODUTOS */

      var totalProductSale = products.filter((verify) => {
        return verify.value;
      });

      var calcTotalProductSale = totalProductSale.reduce((sum, verify) => {
        return sum + verify.value;
      }, 0);

      //** TOTAL DOS SERVIÇOS */

      var totalServices = services.filter((verify) => {
        return verify.valueServices;
      });

      var calcTotalServices = totalServices.reduce((sum, verify) => {
        return sum + verify.valueServices;
      }, 0);

      //** TOTAL DAS RECEITAS */

      var totalReceitas = receitas.filter((verify) => {
        return verify.value;
      });

      var calcTotalReceitas = totalReceitas.reduce((sum, verify) => {
        return sum + verify.value;
      }, 0);

      //** TOTAL DAS DESPESAS */

      var totalDespesas = despesas.filter((verify) => {
        return verify.value;
      });

      var calcTotalDespesas = totalDespesas.reduce((sum, verify) => {
        return sum + verify.value;
      }, 0);

      return res.status(200).send({
        products,
        calcTotalProductSale,
        services,
        calcTotalServices,
        receitas,
        calcTotalReceitas,
        despesas,
        calcTotalDespesas,
      });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar as informações" });
  }
});

//Rota para listar os Débitos do Cliente
router.post("/findebits", async (req, res) => {
  const { client } = req.body;

  try {
    const produtos = await PagamentoProdutos.find({
      statusPay: "wait",
      dateToPay: { $lte: DateNow },
    }).populate({ path: "cliente", select: "name" });

    const servicos = await PagamentoServicos.find({
      statusPay: "wait",
      dateToPay: { $lte: DateNow },
    }).populate({ path: "cliente", select: "name" });

    //** CALCULO PRODUTOS */

    var totalProdutos = produtos.filter((verify) => {
      return verify.value;
    });

    var calcTotalProdutos = totalProdutos.reduce((sum, verify) => {
      return sum + verify.value;
    }, 0);

    //** CALCULO SERVICOS */

    var totalServicos = servicos.filter((verify) => {
      return verify.value;
    });

    var calcTotalServicos = totalServicos.reduce((sum, verify) => {
      return sum + verify.value;
    }, 0);

    return res
      .status(200)
      .send({ produtos, servicos, calcTotalProdutos, calcTotalServicos });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar informações" });
  }
});

module.exports = (app) => app.use("/report", router);
