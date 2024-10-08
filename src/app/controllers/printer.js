const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");
const Order = require("../models/ordenServico");
const Sale = require("../models/ordens");
const Address = require("../models/enderecos");
const Clients = require("../models/clientes");
const Company = require("../models/dadosEmpresa");
const url = require("../../configs/logoUrl.json");
const HTMLParser = require("node-html-parser");

//IMPRIMIR VENDA
router.post("/sale", async (req, res) => {
  const { id, mode } = req.body;
  try {
    const sale = await Sale.findOne({ _id: id });
    const client = await Clients.findOne({ _id: sale.client });
    const address = await Address.findOne({ client: sale.client });
    const company = await Company.findOne();
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "pdf"
    );
    const pathToTemplateSimplify = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "order-simplify.ejs"
    );
    const pathToTemplateThermal = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "thermalOrder.ejs"
    );
    const pathToTemplate = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "order.ejs"
    );
    var template;
    if (mode === "matricial") {
      template = pathToTemplateSimplify;
    }
    if (mode === "normal") {
      template = pathToTemplate;
    }
    if (mode === "thermal") {
      template = pathToTemplateThermal;
    }
    var link;
    await ejs.renderFile(
      template,
      {
        company: company,
        client: client,
        address: address,
        sale: sale,
        logo: `${url.logoUrl}/img/${company.logo}`,
        products: sale.products,
        payments: sale.payments.length ? sale.payments : [],
      },
      (err, html) => {
        if (err) {
          return res
            .status(400)
            .send({ message: "Erro ao gerar o relatório para impressão" });
        } else {
          if (mode === "matricial" || mode === "normal") {
            pdf
              .create(html, {
                format: mode === "matricial" ? "A5" : "A4",
                orientation: mode === "matricial" ? "landscape" : "portrait",
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
              .toFile(
                `${pathToFile}/venda-${sale.number}.pdf`,
                (err, response) => {
                  if (err) {
                    console.log("PDF", err);
                    return res.status(400).send({
                      message: "Erro ao gerar o relatório para impressão",
                    });
                  } else {
                    console.log("OK");
                  }
                }
              );
          } else {
            var initialHeight = 11;
            const length = sale.products.length;
            if (length > 1) {
              for (let index = 0; index < length; index++) {
                initialHeight = initialHeight + 0.5;
              }
            }
            const height = `${initialHeight.toString()}cm`;
            pdf
              .create(html, {
                width: "8cm",
                height: height,
                border: {
                  bottom: ".5cm",
                  top: ".5cm",
                  right: ".5cm",
                  left: ".5cm",
                },
                httpHeaders: {
                  "Content-Type": "application/pdf",
                },
              })
              .toFile(
                `${pathToFile}/venda-${sale.number}.pdf`,
                (err, response) => {
                  if (err) {
                    console.log("PDF", err);
                    return res.status(400).send({
                      message: "Erro ao gerar o relatório para impressão",
                    });
                  } else {
                    console.log("OK");
                  }
                }
              );
          }
        }
      }
    );
    link = `${url.logoUrl}/pdf/venda-${sale.number}.pdf`;
    return res.status(200).send({ link });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao gerar o relatório para impressão" });
  }
});

router.post("/order", async (req, res) => {
  const { id, mode } = req.body;
  try {
    const sale = await Order.findOne({ _id: id });
    const client = await Clients.findOne({ _id: sale.client });
    const address = await Address.findOne({ client: sale.client });
    const company = await Company.findOne();
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "pdf"
    );
    const pathToTemplateSimplify = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "servico-simplify.ejs"
    );
    const pathToTemplate = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "servico.ejs"
    );
    const pathToTemplateThermal = path.resolve(
      __dirname,
      "..",
      "..",
      "templates",
      "thermalServ.ejs"
    );
    var template;
    if (mode === "matricial") {
      template = pathToTemplateSimplify;
    }
    if (mode === "normal") {
      template = pathToTemplate;
    }
    if (mode === "thermal") {
      template = pathToTemplateThermal;
    }
    var link;
    await ejs.renderFile(
      template,
      {
        company: company,
        client: client,
        address: address,
        sale: sale,
        logo: `${url.logoUrl}/img/${company.logo}`,
        products: sale.services,
        payments: sale.payments.length ? sale.payments : [],
      },
      (err, html) => {
        if (err) {
          console.log("EJS", err);
          return res
            .status(400)
            .send({ message: "Erro ao gerar o relatório para impressão" });
        } else {
          if (mode === "matricial" || mode === "normal") {
            console.log("ENTROU NO MATRICIAL");
            pdf
              .create(html, {
                format: mode === "matricial" ? "A5" : "A4",
                orientation: mode === "matricial" ? "landscape" : "portrait",
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
              .toFile(
                `${pathToFile}/ordem-${sale.number}.pdf`,
                (err, response) => {
                  if (err) {
                    console.log("PDF", err);
                    return res.status(400).send({
                      message: "Erro ao gerar o relatório para impressão",
                    });
                  } else {
                    console.log("OK");
                  }
                }
              );
          } else {
            var initialHeight = 11;
            const length = sale.services.length;
            if (length > 1) {
              for (let index = 0; index < length; index++) {
                initialHeight = initialHeight + 0.5;
              }
            }
            const height = `${initialHeight.toString()}cm`;
            pdf
              .create(html, {
                width: "8cm",
                height: height,
                border: {
                  bottom: ".5cm",
                  top: ".5cm",
                  right: ".5cm",
                  left: ".5cm",
                },
                httpHeaders: {
                  "Content-Type": "application/pdf",
                },
              })
              .toFile(
                `${pathToFile}/ordem-${sale.number}.pdf`,
                (err, response) => {
                  if (err) {
                    console.log("PDF", err);
                    return res.status(400).send({
                      message: "Erro ao gerar o relatório para impressão",
                    });
                  } else {
                    console.log("OK");
                  }
                }
              );
          }
        }
      }
    );
    link = `${url.logoUrl}/pdf/ordem-${sale.number}.pdf`;
    return res.status(200).send({ link });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ message: "Erro ao gerar o relatório para impressão" });
  }
});

module.exports = (app) => app.use("/printer", router);
