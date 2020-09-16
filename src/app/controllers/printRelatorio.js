const express = require("express");
const router = express.Router();
const pdf = require("html-pdf");
const ejs = require("ejs");
const path = require("path");
const Clients = require("../models/clientes");
const Products = require("../models/produtos");
const Services = require("../models/servicos");
const PagSales = require("../models/pagamentosVendas");
const PagOrders = require("../models/pagamentosServicos");
const Revenues = require("../models/contasReceber");
const Expenses = require("../models/contasPagar");
const Fornecers = require("../models/fornecedores");
const Company = require("../models/dadosEmpresa");
const configs = require("../../configs/logoUrl.json");
const Balancete = require("../models/balancete");
const dateFns = require("date-fns");
const diferenceInDays = dateFns.differenceInDays;

//** ROTA PARA GERAR RELATÓRIO DE CLIENTES */
router.post("/clients", async (req, res) => {
  try {
    const clientes = await Clients.find();
    const company = await Company.findOne();
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "relatorio"
    );
    const pathToTemplate = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "clientes.ejs"
    );
    await ejs.renderFile(
      pathToTemplate,
      {
        company: company,
        clients: clientes,
        logo: `${configs.logoUrl}/img/${company.logo}`,
      },
      (err, html) => {
        if (err) {
          console.log("EJS", err);
          return res
            .status(400)
            .send({ message: "Erro ao gerar o relatório para impressão" });
        } else {
          pdf
            .create(html, {
              format: "A4",
              orientation: "portrait",
              border: {
                bottom: "1cm",
                top: "1cm",
                right: "1cm",
                left: "1cm",
              },
              httpHeaders: {
                "Content-Type": "application/pdf",
              },
            })
            .toFile(`${pathToFile}/clientes.pdf`, (err, response) => {
              if (err) {
                console.log("PDF", err);
                return res.status(400).send({
                  message: "Erro ao gerar o relatório para impressão",
                });
              } else {
                console.log("OK");
              }
            });
        }
      }
    );
    const link = `${configs.logoUrl}/relatorio/clientes.pdf`;
    return res.status(200).send({ link });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ message: "Erro ao gerar o relatório para impressão" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const clientes = await Products.find();
    const company = await Company.findOne();
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "relatorio"
    );
    const pathToTemplate = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "produtos.ejs"
    );
    await ejs.renderFile(
      pathToTemplate,
      {
        company: company,
        products: clientes,
        logo: `${configs.logoUrl}/img/${company.logo}`,
      },
      (err, html) => {
        if (err) {
          console.log("EJS", err);
          return res
            .status(400)
            .send({ message: "Erro ao gerar o relatório para impressão" });
        } else {
          pdf
            .create(html, {
              format: "A4",
              orientation: "portrait",
              border: {
                bottom: "1cm",
                top: "1cm",
                right: "1cm",
                left: "1cm",
              },
              httpHeaders: {
                "Content-Type": "application/pdf",
              },
            })
            .toFile(`${pathToFile}/produtos.pdf`, (err, response) => {
              if (err) {
                console.log("PDF", err);
                return res.status(400).send({
                  message: "Erro ao gerar o relatório para impressão",
                });
              } else {
                console.log("OK");
              }
            });
        }
      }
    );
    const link = `${configs.logoUrl}/relatorio/produtos.pdf`;
    return res.status(200).send({ link });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ message: "Erro ao gerar o relatório para impressão" });
  }
});

router.post("/services", async (req, res) => {
  try {
    const clientes = await Services.find();
    const company = await Company.findOne();
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "relatorio"
    );
    const pathToTemplate = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "servicos.ejs"
    );
    await ejs.renderFile(
      pathToTemplate,
      {
        company: company,
        services: clientes,
        logo: `${configs.logoUrl}/img/${company.logo}`,
      },
      (err, html) => {
        if (err) {
          console.log("EJS", err);
          return res
            .status(400)
            .send({ message: "Erro ao gerar o relatório para impressão" });
        } else {
          pdf
            .create(html, {
              format: "A4",
              orientation: "portrait",
              border: {
                bottom: "1cm",
                top: "1cm",
                right: "1cm",
                left: "1cm",
              },
              httpHeaders: {
                "Content-Type": "application/pdf",
              },
            })
            .toFile(`${pathToFile}/servicos.pdf`, (err, response) => {
              if (err) {
                console.log("PDF", err);
                return res.status(400).send({
                  message: "Erro ao gerar o relatório para impressão",
                });
              } else {
                console.log("OK");
              }
            });
        }
      }
    );
    const link = `${configs.logoUrl}/relatorio/servicos.pdf`;
    return res.status(200).send({ link });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ message: "Erro ao gerar o relatório para impressão" });
  }
});

router.post("/fornecers", async (req, res) => {
  try {
    const clientes = await Fornecers.find();
    const company = await Company.findOne();
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "relatorio"
    );
    const pathToTemplate = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "fornecedores.ejs"
    );
    await ejs.renderFile(
      pathToTemplate,
      {
        company: company,
        fornecers: clientes,
        logo: `${configs.logoUrl}/img/${company.logo}`,
      },
      (err, html) => {
        if (err) {
          console.log("EJS", err);
          return res
            .status(400)
            .send({ message: "Erro ao gerar o relatório para impressão" });
        } else {
          pdf
            .create(html, {
              format: "A4",
              orientation: "portrait",
              border: {
                bottom: "1cm",
                top: "1cm",
                right: "1cm",
                left: "1cm",
              },
              httpHeaders: {
                "Content-Type": "application/pdf",
              },
            })
            .toFile(`${pathToFile}/fornecedores.pdf`, (err, response) => {
              if (err) {
                console.log("PDF", err);
                return res.status(400).send({
                  message: "Erro ao gerar o relatório para impressão",
                });
              } else {
                console.log("OK");
              }
            });
        }
      }
    );
    const link = `${configs.logoUrl}/relatorio/fornecedores.pdf`;
    return res.status(200).send({ link });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ message: "Erro ao gerar o relatório para impressão" });
  }
});

router.post("/contas", async (req, res) => {
  const { type, month, year } = req.body;
  try {
    var contas;
    if (type === "revenues") {
      contas = await Revenues.find({ month, year });
    } else {
      contas = await Expenses.find({ month, year });
    }
    const company = await Company.findOne();
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "relatorio"
    );
    const pathToTemplate = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "contas.ejs"
    );
    function Somar() {
      let total = contas.reduce(function (total, numero) {
        return total + numero.value;
      }, 0);
      return total;
    }
    await ejs.renderFile(
      pathToTemplate,
      {
        tipo: type === "revenues" ? "CONTAS A RECEBER" : "CONTAS A PAGAR",
        company: company,
        county: contas,
        logo: `${configs.logoUrl}/img/${company.logo}`,
        mes: month,
        ano: year,
        soma: Somar(),
      },
      (err, html) => {
        if (err) {
          console.log("EJS", err);
          return res
            .status(400)
            .send({ message: "Erro ao gerar o relatório para impressão" });
        } else {
          pdf
            .create(html, {
              format: "A4",
              orientation: "portrait",
              border: {
                bottom: "1cm",
                top: "1cm",
                right: "1cm",
                left: "1cm",
              },
              httpHeaders: {
                "Content-Type": "application/pdf",
              },
            })
            .toFile(`${pathToFile}/contas.pdf`, (err, response) => {
              if (err) {
                console.log("PDF", err);
                return res.status(400).send({
                  message: "Erro ao gerar o relatório para impressão",
                });
              } else {
                console.log("OK");
              }
            });
        }
      }
    );
    const link = `${configs.logoUrl}/relatorio/contas.pdf`;
    return res.status(200).send({ link });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ message: "Erro ao gerar o relatório para impressão" });
  }
});

router.post("/payments", async (req, res) => {
  const { type, month, year, client, pay } = req.body;
  try {
    const clienteFind = await Clients.findOne({ _id: client });
    var vendas;
    var ordens;
    if (type === 1) {
      vendas = await PagSales.find({
        month,
        year,
        cliente: client,
        statusPay: pay,
      }).populate({
        path: "cliente",
        select: "name",
      });
      ordens = await PagOrders.find({
        month,
        year,
        cliente: client,
        statusPay: pay,
      }).populate({
        path: "cliente",
        select: "name",
      });
    }
    if (type === 2) {
      vendas = await PagSales.find({
        cliente: client,
        statusPay: pay,
      }).populate({
        path: "cliente",
        select: "name",
      });
      ordens = await PagOrders.find({
        cliente: client,
        statusPay: pay,
      }).populate({
        path: "cliente",
        select: "name",
      });
    }
    const company = await Company.findOne();
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "relatorio"
    );
    const pathToTemplate = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "debitos.ejs"
    );
    function Somar(valor) {
      let total = valor.reduce(function (total, numero) {
        return total + numero.value;
      }, 0);
      return total;
    }
    async function CalculateAtraso(valor) {
      let arra = [];
      let data = new Date();
      await valor.forEach((e) => {
        var itens = {
          cliente: e.cliente.name,
          datePay: e.datePay,
          atraso: diferenceInDays(data, e.dateToPay),
          value: e.value,
          status: e.statusPay,
        };
        arra.push(itens);
      });
      return arra;
    }
    console.log(await CalculateAtraso(vendas));
    await ejs.renderFile(
      pathToTemplate,
      {
        tipo:
          type === 1
            ? `PAGAMENTOS DO CLIENTE: ${clienteFind.name} DO MÊS ${month} DE ${year}`
            : `PAGAMENTOS DO CLIENTE: ${clienteFind.name}`,
        company: company,
        vendas: await CalculateAtraso(vendas),
        ordens: await CalculateAtraso(ordens),
        logo: `${configs.logoUrl}/img/${company.logo}`,
        mes: month,
        ano: year,
        somaVendas: Somar(vendas),
        somaOrdens: Somar(ordens),
        totalGeral: Somar(vendas) + Somar(ordens),
      },
      (err, html) => {
        if (err) {
          console.log("EJS", err);
          return res
            .status(400)
            .send({ message: "Erro ao gerar o relatório para impressão" });
        } else {
          pdf
            .create(html, {
              format: "A4",
              orientation: "portrait",
              border: {
                bottom: "1cm",
                top: "1cm",
                right: "1cm",
                left: "1cm",
              },
              httpHeaders: {
                "Content-Type": "application/pdf",
              },
            })
            .toFile(`${pathToFile}/debitos.pdf`, (err, response) => {
              if (err) {
                console.log("PDF", err);
                return res.status(400).send({
                  message: "Erro ao gerar o relatório para impressão",
                });
              } else {
                console.log("OK");
              }
            });
        }
      }
    );
    const link = `${configs.logoUrl}/relatorio/debitos.pdf`;
    return res.status(200).send({ link });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ message: "Erro ao gerar o relatório para impressão" });
  }
});

module.exports = (app) => app.use("/printerRelatorio", router);
