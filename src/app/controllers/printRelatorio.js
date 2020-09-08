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

module.exports = (app) => app.use("/printerRelatorio", router);
