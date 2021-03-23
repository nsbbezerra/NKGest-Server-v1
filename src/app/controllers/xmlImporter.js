const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multerConfig = require("../../configs/multerConfig");
const multer = require("multer");
const upload = multer(multerConfig);
const NFe = require("djf-nfe");
const shortId = require("shortid");
const Produtos = require("../models/produtos");
const Fornecedores = require("../models/fornecedores");
const XmlImporter = require("../models/xmlImportados");
const dateFns = require("date-fns");
const Updated = require("../models/updatedProducts");
const xmlParser = require("xml-js");

//Rota para importar o arquivo xml
router.post("/importXml", upload.single("xml"), async (req, res) => {
  const { filename } = req.file;
  try {
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "public",
      "xml",
      `${filename}`
    );
    const fileToRead = fs.readFileSync(pathToFile, "utf-8");
    const xml = NFe(fileToRead);
    const xmlTwo = xmlParser.xml2json(fileToRead, { compact: true, spaces: 4 });
    let parsed = JSON.parse(xmlTwo);
    let attrsIPI = parsed.nfeProc.NFe.infNFe.det;

    //EMITENTE
    let fornecer;
    let typeFornecer;
    let emitente = xml.emitente();
    const emitNome = emitente.nome();
    const fornecedor = await Fornecedores.findOne({ socialName: emitNome });
    let endereco = emitente.endereco();
    let cnpjFornecedor = emitente.inscricaoNacional();
    if (cnpjFornecedor.length === 14) {
      typeFornecer = "juridic";
    } else {
      typeFornecer = "fisic";
    }
    if (!fornecedor) {
      const newFornecer = await Fornecedores.create({
        name: emitente.fantasia(),
        cpf_cnpj: emitente.inscricaoNacional(),
        email: emitente.email(),
        socialName: emitente.nome(),
        municipalRegistration: emitente.inscricaoMunicipal(),
        stateRegistration: emitente.inscricaoEstadual(),
        cep: endereco.cep(),
        city: endereco.municipio(),
        state: endereco.uf(),
        munipalCode: endereco.codigoMunicipio(),
        typeClient: typeFornecer,
      });
      fornecer = newFornecer;
    } else {
      fornecer = fornecedor;
    }

    //PRODUTOS
    const numeroItems = xml.nrItens();
    var produtos = [];
    for (let index = 1; index < numeroItems + 1; index++) {
      let total = xml.total();
      let valorFrete = parseFloat(total.valorFrete()) / numeroItems;
      let item = xml.item(index);
      let icms = item.imposto().icms();
      let pis = item.imposto().pis();
      let cofins = item.imposto().cofins();
      let nomeXml = (await attrsIPI.length)
        ? attrsIPI.find((obj) => obj.prod.xProd._text === item.descricao())
        : attrsIPI;
      let ipi = nomeXml.imposto.IPI ? nomeXml.imposto.IPI : "";
      let cstIpi = ipi !== "" ? ipi.IPITrib.CST._text : "";
      let ipiRate = ipi !== "" ? ipi.IPITrib.pIPI._text : 0;
      let codeIpi = ipi !== "" ? ipi.cEnq._text : "";
      await produtos.push({
        id: shortId.generate(),
        nome: item.descricao(),
        codigo: item.codigo(),
        codeBarras: item.ean(),
        cest: item.cest(),
        unidadeComercial: item.unidadeComercial(),
        unidadeTributavel: item.unidadeTributavel(),
        codigoBeneficioFiscal: item.codigoBeneficioFiscal(),
        cfop: item.cfop(),
        quantidadeComercial: parseInt(item.quantidadeComercial()),
        quantidadeTributavel: parseFloat(item.quantidadeTributavel()),
        valorUnitarioTributavel: parseFloat(item.valorUnitarioTributavel()),
        valorUnitarioComercial: parseFloat(item.valorUnitario()),
        valorDoFrete: valorFrete,
        outrasDespesas: parseFloat(item.valorOutrasDespesas()),
        informacoes: item.informacoesProduto(),
        valorTotal:
          parseInt(item.quantidadeComercial()) *
          parseFloat(item.valorUnitario()),
        icms: {
          icmsCst: icms.cst(),
          icmsBaseCalculo: parseFloat(icms.baseCalculo()),
          icmsCsosn: icms.csosn(),
          icmsPorcentagem: parseFloat(icms.porcetagemIcms()),
          icmsAliquotaSt: parseFloat(icms.porcetagemIcmsST()),
          icmsValor: parseFloat(icms.valorIcms()),
          icmsBaseCalculoSt: parseFloat(icms.baseCalculoIcmsST()),
          valorIcmsSt: parseFloat(icms.valorIcmsST()),
          icmsOrigem: icms.origem(),
          icmsMargemValorAdicionadoSt: parseFloat(icms.porcentagemMVAST()),
          icmsModalidadeBaseCalculoSt: icms.modalidadeBCST(),
          valorFcp: parseFloat(icms.valorFCP()),
          valorFcpSt: parseFloat(icms.valorFCPST()),
          valorFcpRetido: parseFloat(icms.valorFCPSTRetido()),
          porcentagemFcp: parseFloat(icms.porcentagemFCP()),
          porcentagemFcpSt: parseFloat(icms.porcentagemFCPST()),
          porcentagemFcpRetido: parseFloat(icms.porcentagemFCPSTRetido()),
          baseCalculoFcp: parseFloat(icms.baseCalculoFCP()),
          baseCalculoFcpSt: parseFloat(icms.baseCalculoFCPST()),
          baseCalculoFcpRetido: parseFloat(icms.baseCalculoFCPSTRetido()),
          icmsValue: parseFloat(icms.valorIcms()),
          icmsValueSt: parseFloat(icms.valorIcmsST()),
          icmsBaseCalc: parseFloat(icms.baseCalculo()),
          icmsBaseCalcSt: parseFloat(icms.baseCalculoIcmsST()),
        },
        pis: {
          pisCst: pis.cst(),
          pisBaseCalculo: parseFloat(pis.baseCalculo()),
          valorPis: parseFloat(pis.valorPIS()),
          pisPorcentagem: parseFloat(pis.porcentagemPIS()),
        },
        cofins: {
          cofinsCst: cofins.cst(),
          cofinsBaseCalculo: parseFloat(cofins.baseCalculo()),
          porcentagemCofins: parseFloat(cofins.porcentagemCOFINS()),
          valorCofins: parseFloat(cofins.valorCOFINS()),
        },
        ncm: item.ncm(),
        valorVenda: 0,
        ipi: { code: codeIpi, rate: parseFloat(ipiRate), cst: cstIpi },
      });
    }

    //Chave NFE
    const protocolo = xml.informacoesProtocolo();
    const infoNota = xml.identificacaoNFe();
    const totalNota = xml.total();
    let infoProtocolo = await {
      chaveNfe: protocolo.chave(),
      protocolo: protocolo.protocolo(),
      naturezaOperacao: infoNota.naturezaOperacao(),
      numeroNota: infoNota.nrNota(),
      serieNota: infoNota.serie(),
      operacao: infoNota.operacao(),
      dataEmissao: infoNota.dataEmissao(),
      baseCalculoIcms: totalNota.baseCalculoIcms(),
      totalIcms: totalNota.valorIcms(),
      toalIcmsDesonerado: totalNota.valorIcmsDesonerado(),
      baseCalculoIcmsSt: totalNota.baseCalculoIcmsST(),
      baseCalculoIcmsRetido: totalNota.baseCalculoIcmsSTRetido(),
      totalIcmsSt: totalNota.valorIcmsST(),
      totalIcmsStRetido: totalNota.valorIcmsSTRetido(),
      totalProdutos: totalNota.valorProdutos(),
      totalFrete: totalNota.valorFrete(),
      valorDesconto: totalNota.valorDesconto(),
      valorSeguro: totalNota.valorSeguro(),
      valorPis: totalNota.valorPIS(),
      valorCofins: totalNota.valorCOFINS(),
      valorOutrasDespesas: totalNota.valorOutrasDespesas(),
      valorNota: totalNota.valorNota(),
      totalTributos: totalNota.valorTotalTributos(),
    };

    //APAGAR ARQUIVO XML
    await fs.unlink(pathToFile, function (err) {
      if (err) return console.log(err);
      console.log("file deleted successfully");
    });

    return res.status(200).send({ produtos, fornecer, infoProtocolo });
  } catch (error) {
    console.log(error);
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "public",
      "xml",
      `${filename}`
    );
    await fs.unlink(pathToFile, function (err) {
      if (err) return console.log(err);
      console.log("file deleted successfully");
    });
    return res.status(400).send({ message: "Erro ao importar o arquivo" });
  }
});

//Cadastro de Produtos
router.post("/saveProducts", async (req, res) => {
  const { chaveNfe, products, fornecedor } = req.body;
  const dataFormated = dateFns.format(new Date(), "dd/MM/yyyy");
  try {
    const findImported = await XmlImporter.findOne({ idNfe: chaveNfe });
    if (findImported) {
      return res.status(400).send({ message: "Esta NFE já foi importada" });
    }
    const allProducts = await Produtos.find();
    const numberItens = products.length;
    for (let index = 0; index < numberItens; index++) {
      const product = products[index];
      await registerProduct(product);
    }
    async function registerProduct(prod) {
      let otherExpenses;
      let icmsPercent;
      let icmsSTPercent;
      let icmsSTAddPercent;
      let FCPPercent;
      let FCPSTPercent;
      let FCPRetPercent;
      let pisPercent;
      let cofinsPercent;
      let valueFrete;
      let csosnIcms = "";
      let ipiCstVal;
      let ipiRateVal;
      let ipiCode;
      let icmsValue = !prod.icms.icmsValue ? 0 : prod.icms.icmsValue;
      let icmsValueSt = !prod.icms.icmsValueSt ? 0 : prod.icms.icmsValueSt;
      let icmsBaseCalc = !prod.icms.icmsBaseCalc ? 0 : prod.icms.icmsBaseCalc;
      let icmsBaseCalcSt = !prod.icms.icmsBaseCalcSt
        ? 0
        : prod.icms.icmsBaseCalcSt;
      otherExpenses = !prod.outrasDespesas ? 0 : prod.outrasDespesas;
      icmsPercent = !prod.icms.icmsPorcentagem ? 0 : prod.icms.icmsPorcentagem;
      icmsSTPercent = !prod.icms.icmsAliquotaSt ? 0 : prod.icms.icmsAliquotaSt;
      icmsSTAddPercent = !prod.icms.icmsMargemValorAdicionadoSt
        ? 0
        : prod.icms.icmsMargemValorAdicionadoSt;
      FCPPercent = !prod.icms.porcentagemFcp ? 0 : prod.icms.porcentagemFcp;
      FCPSTPercent = !prod.icms.porcentagemFcpSt
        ? 0
        : prod.icms.porcentagemFcpSt;
      FCPRetPercent = !prod.icms.porcentagemFcpRetido
        ? 0
        : prod.icms.porcentagemFcpRetido;
      pisPercent = !prod.pis.pisPorcentagem ? 0 : prod.pis.pisPorcentagem;
      cofinsPercent = !prod.cofins.porcentagemCofins
        ? 0
        : prod.cofins.porcentagemCofins;
      cofinsValue = !prod.cofins.valorCofins ? 0 : prod.cofins.valorCofins;
      valueFrete = !prod.valorDoFrete ? 0 : prod.valorDoFrete;
      ipiCode = !prod.ipi.code ? "" : prod.ipi.code;
      ipiCstVal = !prod.ipi.cst ? "" : prod.ipi.cst;
      ipiRateVal = !prod.ipi.rate ? 0 : prod.ipi.rate;

      if (prod.icms.icmsCst === "") {
        csosnIcms = prod.icms.icmsCsosn;
      } else {
        csosnIcms = prod.icms.icmsCst;
      }

      let cofins = await { rate: cofinsPercent, cst: prod.cofins.cofinsCst };
      let pis = await { rate: pisPercent, cst: prod.pis.pisCst };
      let icms = await {
        rate: icmsPercent,
        origin: prod.icms.icmsOrigem,
        csosn: csosnIcms,
        icmsSTRate: icmsSTPercent,
        icmsMargemValorAddST: icmsSTAddPercent,
        icmsSTModBC: prod.icms.icmsModalidadeBaseCalculoSt,
        fcpRate: FCPPercent,
        fcpSTRate: FCPSTPercent,
        fcpRetRate: FCPRetPercent,
        ipiCst: ipiCstVal,
        ipiRate: ipiRateVal,
        ipiCode: ipiCode,
        icmsValue,
        icmsValueSt,
        icmsBaseCalc,
        icmsBaseCalcSt,
      };
      const resultProduct = await allProducts.find(
        (obj) => obj.name === prod.nome
      );
      if (resultProduct) {
        await Produtos.findOneAndUpdate(
          { _id: resultProduct._id },
          {
            $set: {
              codeUniversal: prod.codeBarras,
              description: prod.informacoes,
              valueCusto: prod.valorUnitarioComercial,
              valueDiversos: otherExpenses,
              frete: valueFrete,
              valueSale: prod.valorVenda,
              estoqueAct: resultProduct.estoqueAct + prod.quantidadeComercial,
              confirmStatus: true,
              atualized: true,
              icms: icms,
              pis: pis,
              cofins: cofins,
              cest: prod.cest,
              ncm: prod.ncm,
            },
          }
        );
      } else {
        await Produtos.create({
          codeUniversal: prod.codeBarras,
          description: prod.informacoes,
          valueCusto: prod.valorUnitarioComercial,
          valueDiversos: otherExpenses,
          frete: valueFrete,
          valueSale: prod.valorVenda,
          estoqueAct: prod.quantidadeComercial,
          confirmStatus: true,
          icms: icms,
          pis: pis,
          cofins: cofins,
          cest: prod.cest,
          ncm: prod.ncm,
          name: prod.nome,
          codiname: prod.nome,
          fornecedor: fornecedor,
          unMedida: prod.unidadeComercial,
          code: shortId.generate(),
          createDate: dataFormated,
          cfop: prod.cfop,
        });
      }
    }
    await XmlImporter.create({ idNfe: chaveNfe, importerDate: dataFormated });
    return res.status(200).send({ message: "Itens cadastrados com sucesso" });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Erro ao cadastrar os itens" });
  }
});

//Rota para excluir um produto
router.delete("/delProduct/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Produtos.findByIdAndRemove(id);
    return res.status(200).send({ message: "Produto excluído com sucesso" });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Ocorreu um erro ao excluir o produto" });
  }
});

//Rota para atualizar os impostos dos produtos já cadastrados
router.post("/updateProducts", upload.single("xml"), async (req, res) => {
  const { filename } = req.file;

  try {
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "public",
      "xml",
      `${filename}`
    );
    const fileToRead = fs.readFileSync(pathToFile, "utf-8");
    const xml = NFe(fileToRead);
    const dataFormated = dateFns.format(new Date(), "dd/MM/yyyy");
    const protocolo = xml.informacoesProtocolo();
    const chaveNfe = protocolo.chave();
    const xmlTwo = xmlParser.xml2json(fileToRead, { compact: true, spaces: 4 });
    let parsed = JSON.parse(xmlTwo);
    let attrsIPI = parsed.nfeProc.NFe.infNFe.det;

    const findUpdated = await Updated.findOne({ idNfe: chaveNfe });

    if (findUpdated) {
      return res
        .status(400)
        .send({ message: "Os produtos desta NFE já foram alterados" });
    }

    const numeroItems = xml.nrItens();

    console.log("NUMERO DFE", numeroItems);
    console.log("NUMER XML JS", attrsIPI.length);

    const todosProdutos = await Produtos.find();

    for (let index = 1; index < numeroItems + 1; index++) {
      let item = xml.item(index);
      let icms = item.imposto().icms();
      let pis = item.imposto().pis();
      let cofins = item.imposto().cofins();

      let nome = item.descricao();

      let nomeXml = await attrsIPI.find((obj) => obj.prod.xProd._text === nome);
      let ipi = nomeXml ? nomeXml.imposto.IPI : null;
      let cstIpi = ipi ? ipi.IPITrib.CST._text : "";
      let ipiRate = ipi ? ipi.IPITrib.pIPI._text : 0;
      let codeIpi = ipi ? ipi.cEnq._text : "";

      let cst = icms.cst();
      let csosn = icms.csosn();
      let csosnIcms = "";

      if (cst === "") {
        if (csosn === "201" || csosn === "202" || csosn === "203") {
          csosnIcms = 500;
        } else {
          csosnIcms = csosn;
        }
      } else {
        if (cst === "00") {
          csosnIcms = 102;
        }
        if (cst === "10") {
          csosnIcms = 500;
        }
        if (cst === "30") {
          csosnIcms = 500;
        }
        if (cst === "40") {
          csosnIcms = 300;
        }
        if (cst === "41") {
          csosnIcms = 400;
        }
        if (cst === "60") {
          csosnIcms = 500;
        }
        if (cst === "50" || cst === "51") {
          csosnIcms = 103;
        }
        if (cst === "70") {
          csosnIcms = 203;
        }
        if (cst === "20") {
          csosnIcms = 103;
        }
      }

      let Icms = await {
        rate:
          icms.porcetagemIcms() === "" ? 0 : parseFloat(icms.porcetagemIcms()),
        origin: icms.origem(),
        csosn: csosnIcms,
        icmsSTRate:
          icms.porcetagemIcmsST() === ""
            ? 0
            : parseFloat(icms.porcetagemIcmsST()),
        icmsMargemValorAddST:
          icms.porcentagemMVAST() === ""
            ? 0
            : parseFloat(icms.porcentagemMVAST()),
        icmsSTModBC: icms.modalidadeBCST(),
        fcpRate:
          icms.porcentagemFCP() === "" ? 0 : parseFloat(icms.porcentagemFCP()),
        fcpSTRate:
          icms.porcentagemFCPST() === ""
            ? 0
            : parseFloat(icms.porcentagemFCPST()),
        fcpRetRate:
          icms.porcentagemFCPSTRetido() === ""
            ? 0
            : parseFloat(icms.porcentagemFCPSTRetido()),
        ipiCst: cstIpi,
        ipiRate: parseFloat(ipiRate),
        ipiCode: codeIpi,
      };

      let Pis = await {
        rate:
          pis.porcentagemPIS() === "" ? 0 : parseFloat(pis.porcentagemPIS()),
        cst: pis.cst(),
      };
      let Cofins = await {
        rate:
          cofins.porcentagemCOFINS() === ""
            ? 0
            : parseFloat(cofins.porcentagemCOFINS()),
        cst: cofins.cst(),
      };

      updateProductsAll(Icms, Pis, Cofins, nome);
    }

    async function updateProductsAll(icms, pis, cofins, nome) {
      const result = await todosProdutos.find((obj) => obj.name === nome);
      if (result) {
        await Produtos.findOneAndUpdate(
          { _id: result._id },
          { $set: { icms: icms, pis: pis, cofins: cofins } }
        );
      }
    }

    await Updated.create({ idNfe: chaveNfe, importerDate: dataFormated });

    await fs.unlink(pathToFile, function (err) {
      if (err) return console.log(err);
      console.log("file deleted successfully");
    });

    return res.status(200).send({ message: "Impostos alterados com sucesso" });
  } catch (error) {
    const pathToFile = path.resolve(
      __dirname,
      "..",
      "..",
      "public",
      "xml",
      `${filename}`
    );
    await fs.unlink(pathToFile, function (err) {
      if (err) return console.log(err);
      console.log("file deleted successfully");
    });
    return res.status(400).send({ message: "Erro ao atualizar os produtos" });
  }
});

module.exports = (app) => app.use("/xmlImport", router);
