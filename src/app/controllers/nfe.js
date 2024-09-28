const express = require("express");
const router = express.Router();
const Vendas = require("../models/ordens");
const Ordens = require("../models/ordenServico");
const Empresa = require("../models/dadosEmpresa");
const Clientes = require("../models/clientes");
const Endereco = require("../models/enderecos");
const Produtos = require("../models/produtos");
const NfeConfig = require("../../configs/nfeioConfig.json");
const ConfigsGlobal = require("../models/configs");
const dateFns = require("date-fns");
const NFE = require("../models/nfe");
const shortId = require("shortid");

const DateNow = new Date();
const monthDate = DateNow.getMonth();
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

//Rota para buscar as vendas e ordens (com opção de busca);
router.post("/finder", async (req, res) => {
  const { find, client, mes, ano, number } = req.body;

  try {
    //Rota para buscar do mês atual
    if (find === 1) {
      const vendas = await Vendas.find({
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate],
        year: yearDate,
        $or: [{ rascunhoNFCE: { $exists: false } }, { rascunhoNFCE: false }],
      }).populate({
        path: "planoDeConta funcionario client address",
        select:
          "name planoConta street number bairro city state phoneComercial celOne",
      });

      const ordens = await Ordens.find({
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate],
        year: yearDate,
        $or: [{ rascunhoNFCE: { $exists: false } }, { rascunhoNFCE: false }],
      }).populate({
        path: "planoDeConta funcionario client veicles",
        select:
          "name planoConta model street number bairro city state phoneComercial celOne",
      });

      return res.status(200).send({ vendas, ordens });
    }

    //Buscar por Cliente
    if (find === 2) {
      const vendas = await Vendas.find({
        client: client,
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
        $or: [{ rascunhoNFCE: { $exists: false } }, { rascunhoNFCE: false }],
      }).populate({
        path: "planoDeConta funcionario client address",
        select:
          "name planoConta street number bairro city state phoneComercial celOne",
      });

      const ordens = await Ordens.find({
        client: client,
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
        $or: [{ rascunhoNFCE: { $exists: false } }, { rascunhoNFCE: false }],
      }).populate({
        path: "planoDeConta funcionario client veicles",
        select:
          "name planoConta model street number bairro city state phoneComercial celOne",
      });

      return res.status(200).send({ vendas, ordens });
    }

    if (find === 3) {
      const vendas = await Vendas.find({
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
        $or: [{ rascunhoNFCE: { $exists: false } }, { rascunhoNFCE: false }],
      }).populate({
        path: "planoDeConta funcionario client address",
        select:
          "name planoConta street number bairro city state phoneComercial celOne",
      });

      const ordens = await Ordens.find({
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
        $or: [{ rascunhoNFCE: { $exists: false } }, { rascunhoNFCE: false }],
      }).populate({
        path: "planoDeConta funcionario client veicles",
        select:
          "name planoConta model street number bairro city state phoneComercial celOne",
      });

      return res.status(200).send({ vendas, ordens });
    }

    if (find === 4) {
      const vendas = await Vendas.find({
        number: number,
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
        $or: [{ rascunhoNFCE: { $exists: false } }, { rascunhoNFCE: false }],
      }).populate({
        path: "planoDeConta funcionario client address",
        select:
          "name planoConta street number bairro city state phoneComercial celOne",
      });

      const ordens = await Ordens.find({
        number: number,
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
        $or: [{ rascunhoNFCE: { $exists: false } }, { rascunhoNFCE: false }],
      }).populate({
        path: "planoDeConta funcionario client veicles",
        select:
          "name planoConta model street number bairro city state phoneComercial celOne",
      });

      return res.status(200).send({ vendas, ordens });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar os dados" });
  }
});

//Rota para gerar rascunho nfe
router.post("/nfeRasc", async (req, res) => {
  const {
    cliente,
    venda,
    cfop,
    icms,
    pis,
    cofins,
    config,
    frete,
    natOpe,
    obs,
  } = req.body;

  try {
    const products = await Produtos.find();
    const company = await Empresa.find();
    const address = await Endereco.findOne({ client: cliente });
    const client = await Clientes.findOne({ _id: cliente });
    const sale = await Vendas.findOne({ _id: venda });
    const configs = await ConfigsGlobal.find();

    if (!configs.length) {
      return res.status(400).send({
        message:
          "As configurações da alíquota de ICMS não foram encontradas, por favor vá até: Configurações/Sistema para o cadastro das mesmas",
      });
    }

    let documentClient = client.cpf_cnpj
      .normalize("NFD")
      .replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, "");
    let documentCompany = company[0].cnpj
      .normalize("NFD")
      .replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, "");
    let cepClient = address.cep.replace(".", "");
    let phoneClient;
    if (client.typeClient === "fisic") {
      phoneClient = client.celOne
        .normalize("NFD")
        .replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, "");
    } else {
      phoneClient = client.phoneComercial
        .normalize("NFD")
        .replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, "");
    }

    if (client.typeClient === "fisic") {
      let inscricaoEstadual;
      if (client.stateRegistration) {
        inscricaoEstadual = client.stateRegistration;
      } else {
        inscricaoEstadual = "";
      }
      await NFE.create({
        sale: sale._id,
        natureza_operacao: natOpe,
        data_emissao: dateFns.format(new Date(), "yyyy-MM-dd"),
        data_entrada_saida: dateFns.format(new Date(), "yyyy-MM-dd"),
        tipo_documento: config.typeDocument,
        finalidade_emissao: config.finality,
        cnpj_emitente: documentCompany,
        nome_emitente: company[0].socialName,
        nome_fantasia_emitente: company[0].name,
        logradouro_emitente: company[0].street,
        numero_emitente: company[0].number,
        bairro_emitente: company[0].bairro,
        municipio_emitente: company[0].city,
        uf_emitente: company[0].state,
        cep_emitente: company[0].cep,
        inscricao_estadual_emitente: company[0].stateRegistration,
        nome_destinatario: client.name,
        cpf_destinatario: documentClient,
        telefone_destinatario: phoneClient,
        logradouro_destinatario: address.street,
        numero_destinatario: address.number,
        bairro_destinatario: address.bairro,
        municipio_destinatario: address.city,
        uf_destinatario: address.state,
        pais_destinatario: "Brasil",
        cep_destinatario: cepClient,
        valor_frete: frete.value,
        modalidade_frete: frete.mode,
        inscricao_estadual_destinatario: inscricaoEstadual,
        informacoes_adicionais_contribuinte: obs,
      });
    } else {
      await NFE.create({
        sale: sale._id,
        natureza_operacao: natOpe,
        data_emissao: dateFns.format(new Date(), "yyyy-MM-dd"),
        data_entrada_saida: dateFns.format(new Date(), "yyyy-MM-dd"),
        tipo_documento: config.typeDocument,
        finalidade_emissao: config.finality,
        cnpj_emitente: documentCompany,
        nome_emitente: company[0].socialName,
        nome_fantasia_emitente: company[0].name,
        logradouro_emitente: company[0].street,
        numero_emitente: company[0].number,
        bairro_emitente: company[0].bairro,
        municipio_emitente: company[0].city,
        uf_emitente: company[0].state,
        cep_emitente: company[0].cep,
        inscricao_estadual_emitente: company[0].stateRegistration,
        nome_destinatario: client.name,
        cnpj_destinatario: documentClient,
        telefone_destinatario: phoneClient,
        logradouro_destinatario: address.street,
        numero_destinatario: address.number,
        bairro_destinatario: address.bairro,
        municipio_destinatario: address.city,
        uf_destinatario: address.state,
        pais_destinatario: "Brasil",
        cep_destinatario: cepClient,
        valor_frete: frete.value,
        modalidade_frete: frete.mode,
        inscricao_estadual_destinatario: client.stateRegistration,
        informacoes_adicionais_contribuinte: obs,
      });
    }

    const nfeRasc = await NFE.findOne({ sale: sale._id });

    var numeroItem = 1;

    await sale.products.map((prod) => {
      updateItems(prod, numeroItem);
      numeroItem++;
    });

    async function updateItems(prod, number) {
      let result = await products.find((obj) => obj.code === prod.code);
      var icmsRate;
      var desc;
      var icmsMdBC;
      var cfpoNumber;
      var pisCst;
      var cofinsCst;
      var icmsCst;
      var codeProduct;
      var rateIcmsSt;
      var rateFcp;
      var rateFcpSt;
      var rateFcpRet;
      var cstIpi;
      var rateIpi;
      var stMva;
      var codeIpi;
      rateIcmsSt = !result.icms.icmsSTRate ? 0 : result.icms.icmsSTRate;
      rateFcp = !result.icms.fcpRate ? 0 : result.icms.fcpRate;
      rateFcpSt = !result.icms.fcpSTRate ? 0 : result.icms.fcpSTRate;
      rateFcpRet = !result.icms.fcpRetRate ? 0 : result.icms.fcpRetRate;
      cstIpi = !result.icms.ipiCst ? "" : result.icms.ipiCst;
      rateIpi = !result.icms.ipiRate ? 0 : result.icms.ipiRate;
      stMva = !result.icms.icmsMargemValorAddST
        ? 0
        : result.icms.icmsMargemValorAddST;
      codeIpi = !result.icms.ipiCode ? "" : result.icms.ipiCode;
      if (prod.valueDesconto > 0) {
        desc = prod.valueDesconto;
      }
      if (icms.status === true) {
        icmsCst = icms.cst;
      } else {
        icmsCst = result.icms.csosn;
      }
      if (pis.status === true) {
        pisCst = pis.cst;
      } else {
        pisCst = result.pis.cst;
      }
      if (cofins.status === true) {
        cofinsCst = cofins.cst;
      } else {
        cofinsCst = result.cofins.cst;
      }
      if (!result.code) {
        codeProduct = shortId.generate();
      } else {
        codeProduct = result.code;
      }
      if (cfop.status === true) {
        if (icmsCst === "201" || icmsCst === "202" || icmsCst === "203") {
          if (cfop.type === "interno") {
            cfpoNumber = "5405";
          } else {
            cfpoNumber = "6404";
          }
        } else {
          cfpoNumber = cfop.value;
        }
      } else {
        if (icmsCst === "201" || icmsCst === "202" || icmsCst === "203") {
          if (cfop.type === "interno") {
            cfpoNumber = "5405";
          } else {
            cfpoNumber = "6404";
          }
        } else {
          cfpoNumber = result.cfop;
        }
      }
      if (cfop.type === "interno") {
        if (result.icms.rate > 0) {
          if (
            result.icms.origin === "1" ||
            result.icms.origin === "2" ||
            result.icms.origin === "3" ||
            result.icms.origin === "8"
          ) {
            icmsRate = configs[0].icms.importado;
          } else {
            icmsRate = configs[0].icms.interno;
          }
        } else {
          icmsRate = 0;
        }
      } else {
        if (result.icms.rate > 0) {
          if (
            result.icms.origin === "1" ||
            result.icms.origin === "2" ||
            result.icms.origin === "3" ||
            result.icms.origin === "8"
          ) {
            icmsRate = configs[0].icms.importado;
          } else {
            icmsRate = configs[0].icms.externo;
          }
        } else {
          icmsRate = 0;
        }
      }
      if (result.icms.icmsSTModBC) {
        icmsMdBC = result.icms.icmsSTModBC;
      } else {
        icmsMdBC = "";
      }

      let info = await {
        numero_item: number,
        codigo_produto: codeProduct,
        descricao: result.codiname,
        cfop: cfpoNumber,
        unidade_comercial: result.unMedida,
        quantidade_comercial: prod.quantity,
        valor_unitario_comercial: prod.valueUnit,
        valor_unitario_tributavel: prod.valueUnit,
        unidade_tributavel: result.unMedida,
        codigo_ncm: result.ncm,
        quantidade_tributavel: prod.quantity,
        valor_bruto: prod.valueTotal,
        icms_situacao_tributaria: icmsCst,
        icms_origem: result.icms.origin,
        pis_situacao_tributaria: pisCst,
        cofins_situacao_tributaria: cofinsCst,
        valor_desconto: desc,

        icms_valor: result.icms.icmsValue,
        icms_modalidade_base_calculo: result.icms.icmsModBC,
        icms_base_calculo_st: result.icms.icmsBaseCalcSt,
        icms_base_calculo: result.icms.icmsBaseCalc,
        icms_valor_st: result.icms.icmsValueSt,

        icms_aliquota: icmsRate,
        icms_modalidade_base_calculo_st: icmsMdBC,
        icms_margem_valor_adicionado_st: stMva,
        icms_aliquota_st: rateIcmsSt,
        fcp_percentual: rateFcp,
        fcp_percentual_st: rateFcpSt,
        fcp_percentual_retido_st: rateFcpRet,
        ipi_situacao_tributaria: cstIpi,
        ipi_aliquota: rateIpi,
        ipi_codigo_enquadramento_legal: codeIpi,

        pis_aliquota_porcentual: result.pis.rate,
        cofins_aliquota_porcentual: result.cofins.rate,
      };
      await NFE.update({ _id: nfeRasc._id }, { $push: { items: info } });
    }

    await Vendas.findByIdAndUpdate(sale._id, {
      $set: { rascunhoNFE: true, nfe: true },
    });

    let rascunhoId = nfeRasc._id;

    return res
      .status(200)
      .send({ message: "Rascunho gerado com sucesso", rascunhoId });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao gerar o rascunho da NFE" });
  }
});

//Rota para emitir uma Nota Fiscal
router.post("/nfe", async (req, res) => {
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  const request = new XMLHttpRequest();

  const {
    id,
    natureza_operacao,
    tipo_documento,
    finalidade_emissao,
    cnpj_emitente,
    nome_emitente,
    nome_fantasia_emitente,
    logradouro_emitente,
    numero_emitente,
    bairro_emitente,
    municipio_emitente,
    uf_emitente,
    cep_emitente,
    inscricao_estadual_emitente,
    nome_destinatario,
    cpf_destinatario,
    telefone_destinatario,
    logradouro_destinatario,
    numero_destinatario,
    bairro_destinatario,
    municipio_destinatario,
    uf_destinatario,
    cep_destinatario,
    valor_frete,
    modalidade_frete,
    inscricao_estadual_destinatario,
    informacoes_adicionais_contribuinte,
    chave_nfe,
    cpf_emitente,
    cnpj_destinatario,
    items,
  } = req.body;

  try {
    let information = { chave_nfe: chave_nfe };
    const nfe = await NFE.findOneAndUpdate(
      { sale: id },
      {
        $set: {
          natureza_operacao,
          tipo_documento,
          finalidade_emissao,
          cnpj_emitente,
          nome_emitente,
          nome_fantasia_emitente,
          logradouro_emitente,
          numero_emitente,
          bairro_emitente,
          municipio_emitente,
          uf_emitente,
          cep_emitente,
          inscricao_estadual_emitente,
          nome_destinatario,
          cpf_destinatario,
          telefone_destinatario,
          logradouro_destinatario,
          numero_destinatario,
          bairro_destinatario,
          municipio_destinatario,
          uf_destinatario,
          cep_destinatario,
          valor_frete,
          modalidade_frete,
          inscricao_estadual_destinatario,
          informacoes_adicionais_contribuinte,
          notas_referenciadas: information,
          cpf_emitente,
          cnpj_destinatario,
          items,
        },
      },
      { new: true }
    );

    const icms_base_calculo = nfe.items.reduce(
      (partialSum, a) => partialSum + a?.icms_base_calculo || 0,
      0
    );
    const icms_valor_total = nfe.items.reduce(
      (partialSum, a) => partialSum + a?.icms_valor || 0,
      0
    );
    const icms_base_calculo_st = nfe.items.reduce(
      (partialSum, a) => partialSum + a?.icms_base_calculo_st || 0,
      0
    );
    const icms_valor_total_st = nfe.items.reduce(
      (partialSum, a) => partialSum + a?.icms_valor_st || 0,
      0
    );

    const nfeRas = {
      ...nfe,
      icms_base_calculo,
      icms_valor_total,
      icms_base_calculo_st,
      icms_valor_total_st,
    };

    return res.status(200).send({ message: "OK", nfeRas });

    let urlNfe = `${NfeConfig.url}/v2/nfe?ref=${nfeRas.sale}`;

    await request.open("POST", urlNfe, false, NfeConfig.token);

    await request.send(JSON.stringify(nfeRas));

    const response = JSON.parse(request.responseText);

    const statusResponse = response.status;
    const warning = response.codigo;
    let info;

    if (warning === "already_processed") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "requisicao_invalida") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "empresa_nao_habilitada") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "nfe_cancelada") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "permissao_negada") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "nao_encontrado") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "nfe_nao_autorizada") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "nfe_autorizada") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "em_processamento") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "erro_validacao_schema") {
      info = response.codigo;
      let message = response.mensagem;
      let erros = response.erros;
      return res.status(200).send({ message, info, erros });
    }

    if (warning === "erro_validacao") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (statusResponse === "processando_autorizacao") {
      info = response.status;
      await Vendas.findByIdAndUpdate(nfeRas.sale, {
        $set: { nfeStatus: info },
      });
      return res.status(200).send({
        message:
          "Aguarde alguns instantes, a NFE está sendo processada pela SEFAZ",
        info,
      });
    }
    if (statusResponse === "erro_autorizacao") {
      info = response.status;
      await Vendas.findByIdAndUpdate(nfeRas.sale, {
        $set: { nfeStatus: info },
      });
      return res.status(200).send({
        message: "Houve um erro de autorização por parte da SEFAZ",
        info,
      });
    }
    if (statusResponse === "denegado") {
      info = response.status;
      await Vendas.findByIdAndUpdate(nfeRas.sale, {
        $set: { nfeStatus: info },
      });
      return res.status(200).send({
        message:
          "Houve uma inconsistência nos dados cadastrais, a NFE foi denegada pela SEFAZ",
        info,
      });
    }

    return res.status(200).send({ warning });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para excluir o rascunho da NFE
router.delete("/delRasc/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await NFE.findOneAndRemove({ sale: id });

    await Vendas.findByIdAndUpdate(id, {
      $set: { rascunhoNFE: false, nfeStatus: "" },
    });

    return res.status(200).send({ message: "Rascunho excluído com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao excluir o rascunho" });
  }
});

//Consultar status da NFE
router.post("/statusNfe", async (req, res) => {
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  const request = new XMLHttpRequest();

  const { ref } = req.body;

  try {
    let referencia;

    const venda = await Vendas.findOne({ _id: ref });
    const rasc = await NFE.findOne({ sale: ref });

    if (venda.devolve === true) {
      referencia = rasc._id;
    } else {
      referencia = venda._id;
    }

    let urlNfe = `${NfeConfig.url}/v2/nfe/${referencia}?completa=(1)`;

    await request.open("GET", urlNfe, false, NfeConfig.token);

    await request.send();

    const response = JSON.parse(request.responseText);

    console.log(response);

    if (response.codigo === "nao_encontrado") {
      if (referencia === rasc._id) {
        referencia = venda._id;
      } else {
        referencia = rasc._id;
      }
      let urlNfe = `${NfeConfig.url}/v2/nfe/${referencia}?completa=(1)`;

      await request.open("GET", urlNfe, false, NfeConfig.token);

      await request.send();

      const response = JSON.parse(request.responseText);

      console.log("CODIGO", response);

      let info = response.status;

      if (info === "processando_autorizacao") {
        await Vendas.findByIdAndUpdate(ref, { $set: { nfeStatus: info } });
        return res.status(200).send({
          message:
            "Aguarde alguns instantes, a NFE está sendo processada pela SEFAZ",
          info,
        });
      }
      if (info === "autorizado") {
        let danfeUrl = `${NfeConfig.url}${response.caminho_danfe}`;
        let xmlUrl = `${NfeConfig.url}${response.caminho_xml_nota_fiscal}`;
        await Vendas.findByIdAndUpdate(ref, {
          $set: { nfeStatus: info, nfeDanfeUrl: danfeUrl, nfeXmlUrl: xmlUrl },
        });
        return res
          .status(200)
          .send({ message: "NFE Autorizada", info, danfeUrl, xmlUrl });
      }
      if (info === "erro_autorizacao") {
        let statuSefaz = response.status_sefaz;
        let messageSafaz = response.mensagem_sefaz;
        await Vendas.findByIdAndUpdate(ref, { $set: { nfeStatus: info } });
        return res.status(200).send({
          message: "Houve um erro de autorização por parte da SEFAZ",
          statuSefaz,
          messageSafaz,
          info,
        });
      }
      if (info === "cancelado") {
        let xmlCancUrlNFe = `${NfeConfig.url}${response.caminho_xml_cancelamento}`;
        let statuSefaz = response.status_sefaz;
        let messageSafaz = response.mensagem_sefaz;
        await Vendas.findByIdAndUpdate(ref, {
          $set: { nfeStatus: info, xmlCancUrl: xmlCancUrlNFe },
        });
        return res.status(200).send({
          message: "Esta NFE foi cancelada.",
          statuSefaz,
          messageSafaz,
          info,
        });
      }
      if (info === "denegado") {
        await Vendas.findByIdAndUpdate(ref, { $set: { nfeStatus: info } });
        return res.status(200).send({
          message:
            "Houve uma inconsistência nos dados cadastrais, a NFE foi denegada pela SEFAZ",
          info,
        });
      }

      return res.status(200).send({ response });
    }

    let info = response.status;

    if (info === "processando_autorizacao") {
      await Vendas.findByIdAndUpdate(ref, { $set: { nfeStatus: info } });
      return res.status(200).send({
        message:
          "Aguarde alguns instantes, a NFE está sendo processada pela SEFAZ",
        info,
      });
    }
    if (info === "autorizado") {
      let danfeUrl = `${NfeConfig.url}${response.caminho_danfe}`;
      let xmlUrl = `${NfeConfig.url}${response.caminho_xml_nota_fiscal}`;
      await Vendas.findByIdAndUpdate(ref, {
        $set: { nfeStatus: info, nfeDanfeUrl: danfeUrl, nfeXmlUrl: xmlUrl },
      });
      return res
        .status(200)
        .send({ message: "NFE Autorizada", info, danfeUrl, xmlUrl });
    }
    if (info === "erro_autorizacao") {
      let statuSefaz = response.status_sefaz;
      let messageSafaz = response.mensagem_sefaz;
      await Vendas.findByIdAndUpdate(ref, { $set: { nfeStatus: info } });
      return res.status(200).send({
        message: "Houve um erro de autorização por parte da SEFAZ",
        statuSefaz,
        messageSafaz,
        info,
      });
    }
    if (info === "cancelado") {
      let xmlCancUrlNFe = `${NfeConfig.url}${response.caminho_xml_cancelamento}`;
      let statuSefaz = response.status_sefaz;
      let messageSafaz = response.mensagem_sefaz;
      await Vendas.findByIdAndUpdate(ref, {
        $set: { nfeStatus: info, xmlCancUrl: xmlCancUrlNFe },
      });
      return res.status(200).send({
        message: "Esta NFE foi cancelada.",
        statuSefaz,
        messageSafaz,
        info,
      });
    }
    if (info === "denegado") {
      await Vendas.findByIdAndUpdate(ref, { $set: { nfeStatus: info } });
      return res.status(200).send({
        message:
          "Houve uma inconsistência nos dados cadastrais, a NFE foi denegada pela SEFAZ",
        info,
      });
    }

    return res.status(200).send({ response });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para cancelamento de NFE
router.post("/cancelNfe", async (req, res) => {
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  const request = new XMLHttpRequest();

  const { ref, justify } = req.body;

  try {
    let referencia;

    const venda = await Vendas.findOne({ _id: ref });
    const rasc = await NFE.findOne({ sale: ref });

    if (venda.devolve === true) {
      referencia = rasc._id;
    } else {
      referencia = venda._id;
    }

    let url = `${NfeConfig.url}/v2/nfe/${referencia}`;

    await request.open("DELETE", url, false, NfeConfig.token);

    let cancelar = {
      justificativa: `${justify}`,
    };

    request.send(JSON.stringify(cancelar));

    const response = await JSON.parse(request.responseText);

    console.log(response);

    let info = response.status;

    if (info === "cancelado") {
      let urlXml = `${NfeConfig.url}${response.caminho_xml_cancelamento}`;
      let statuSefaz = response.status_sefaz;
      let messageSafaz = response.mensagem_sefaz;
      await Vendas.findByIdAndUpdate(ref, {
        $set: {
          nfeStatus: info,
          xmlCancUrl: urlXml,
          devolve: false,
          correct: false,
        },
      });
      return res.status(200).send({
        message: "NFE cancelada com sucesso",
        statuSefaz,
        messageSafaz,
        info,
      });
    }
    if (info === "requisicao_invalida") {
      let message = response.mensagem;
      await Vendas.findByIdAndUpdate(ref, { $set: { nfeStatus: info } });
      return res.status(200).send({ message, info });
    }
    if (info === "erro_cancelamento") {
      let message = response.mensagem_sefaz;
      return res.status(200).send({ message, info });
    }

    return res.status(200).send({ response });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Ocorreu um erro ao cancelar a NFE" });
  }
});

//Rota para gerar rascunho de nota de devolução
router.post("/nfeRascDev", async (req, res) => {
  const { venda, cfop, natOpe, keyNfe, docType, finality, obs, icmsCst } =
    req.body;

  try {
    let info = { chave_nfe: keyNfe };

    const rasc = await NFE.findOneAndUpdate(
      { sale: venda },
      {
        $set: {
          tipo_documento: docType,
          finalidade_emissao: finality,
          natureza_operacao: natOpe,
          informacoes_adicionais_contribuinte: obs,
        },
      },
      { new: true }
    );

    await NFE.update(
      { _id: rasc._id },
      { $push: { notas_referenciadas: info } }
    );

    await rasc.items.map((item) => {
      updateItem(item);
    });

    async function updateItem(item) {
      await NFE.update(
        { sale: venda, "items.numero_item": item.numero_item },
        {
          $set: {
            "items.$.cfop": cfop,
            "items.$.icms_situacao_tributaria": icmsCst,
          },
        }
      );
    }

    await Vendas.findByIdAndUpdate(venda, { $set: { devolve: true } });

    return res.status(200).send({ message: "Rascunho gerado com sucesso" });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Erro ao gerar o rascunho da NFE" });
  }
});

//Emitir nota de Devoluçãos
router.post("/sendDevNfe", async (req, res) => {
  const { venda } = req.body;

  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  const request = new XMLHttpRequest();

  try {
    const rasc = await NFE.findOne({ sale: venda });

    let urlNfe = `${NfeConfig.url}/v2/nfe?ref=${rasc._id}`;

    await request.open("POST", urlNfe, false, NfeConfig.token);

    await request.send(JSON.stringify(rasc));

    const response = JSON.parse(request.responseText);

    console.log(response);

    const statusResponse = response.status;
    const warning = response.codigo;
    let info;

    if (warning === "already_processed") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "requisicao_invalida") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "empresa_nao_habilitada") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "nfe_cancelada") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "permissao_negada") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "nao_encontrado") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "nfe_nao_autorizada") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "nfe_autorizada") {
      info = response.codigo;
      let message = response.mensagem;
      let danfeUrl = `${NfeConfig.url}${response.caminho_danfe}`;
      let xmlUrl = `${NfeConfig.url}${response.caminho_xml_nota_fiscal}`;
      await Vendas.findByIdAndUpdate(ref, {
        $set: {
          nfeStatus: info,
          nfeDanfeUrl: danfeUrl,
          nfeXmlUrl: xmlUrl,
          devolve: true,
        },
      });
      return res.status(200).send({ message, info, danfeUrl, xmlUrl });
    }

    if (warning === "em_processamento") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (warning === "erro_validacao_schema") {
      info = response.codigo;
      let message = response.mensagem;
      let erros = response.erros;
      return res.status(200).send({ message, info, erros });
    }

    if (warning === "erro_validacao") {
      info = response.codigo;
      let message = response.mensagem;
      return res.status(200).send({ message, info });
    }

    if (statusResponse === "processando_autorizacao") {
      info = response.status;
      await Vendas.findByIdAndUpdate(rasc.sale, {
        $set: { nfeStatus: info, devolve: true },
      });
      return res.status(200).send({
        message:
          "Aguarde alguns instantes, a NFE está sendo processada pela SEFAZ",
        info,
      });
    }
    if (statusResponse === "erro_autorizacao") {
      info = response.status;
      await Vendas.findByIdAndUpdate(rasc.sale, {
        $set: { nfeStatus: info, devolve: true },
      });
      return res.status(200).send({
        message: "Houve um erro de autorização por parte da SEFAZ",
        info,
      });
    }
    if (statusResponse === "denegado") {
      info = response.status;
      await Vendas.findByIdAndUpdate(rasc.sale, {
        $set: { nfeStatus: info, devolve: true },
      });
      return res.status(200).send({
        message:
          "Houve uma inconsistência nos dados cadastrais, a NFE foi denegada pela SEFAZ",
        info,
      });
    }

    return res.status(200).send({ warning });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao emitir a nota de devolução" });
  }
});

//Emitir carta de correção
router.post("/cartaCorrect", async (req, res) => {
  const { ref, correct } = req.body;

  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  const request = new XMLHttpRequest();

  try {
    let urlNfe = `${NfeConfig.url}/v2/nfe/${ref}/carta_correcao`;

    await request.open("POST", urlNfe, false, NfeConfig.token);

    var cce = {
      correcao: `${correct}`,
    };

    await request.send(JSON.stringify(cce));

    const response = JSON.parse(request.responseText);

    console.log(response);

    const statusResponse = response.status;
    const mensagem = response.mensagem_sefaz;

    let danfeUrl = `${NfeConfig.url}${response.caminho_pdf_carta_correcao}`;
    let xmlUrl = `${NfeConfig.url}${response.caminho_xml_carta_correcao}`;

    if (statusResponse === "autorizado") {
      await Vendas.findByIdAndUpdate(ref, {
        $set: {
          statusCorrect: statusResponse,
          pdfCartaCorrect: danfeUrl,
          xmlCartaCorrect: xmlUrl,
          correct: true,
        },
      });
    }

    return res.status(200).send({ statusResponse, mensagem });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao emitir a carta de correção" });
  }
});

//Rota para inutilizar a NFE
router.post("/inutilNFe", async (req, res) => {
  const { serie, numero_inicial, numero_final, justificativa } = req.body;
  try {
    const company = await Empresa.find();
    let documentCompany = company[0].cnpj
      .normalize("NFD")
      .replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, "");
    const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    const request = new XMLHttpRequest();
    let url = `${NfeConfig.url}/v2/nfe/inutilizacao`;
    request.open("POST", url, false, NfeConfig.token);
    var inutiliza = {
      cnpj: documentCompany,
      serie: serie,
      numero_inicial: numero_inicial,
      numero_final: numero_final,
      justificativa: justificativa,
    };
    request.send(JSON.stringify(inutiliza));
    const response = JSON.parse(request.responseText);
    const status = response.status;
    if (status === "autorizado") {
      let message = response.mensagem_sefaz;
      return res.status(200).send({ message, status });
    }
    if (status === "erro_autorizacao") {
      let message = response.mensagem_sefaz;
      return res.status(200).send({ message, status });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao inutilizar NFE" });
  }
});

//Rota para enviar a NFE por Email
router.post("/sendEmailNfe", async (req, res) => {
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  const request = new XMLHttpRequest();

  const { ref, emails } = req.body;

  try {
    let url = `${NfeConfig.url}/v2/nfe/${ref}/email`;

    request.open("POST", url, false, NfeConfig.token);

    let json = JSON.stringify({ emails: emails });

    request.send(json);

    return res.send({ message: "Email enviado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao enviar NFE por email" });
  }
});

//Buscar Rascunho
router.get("/findRasc/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const rasc = await NFE.findOne({ sale: id });
    const sale = await Vendas.findOne({ _id: id });
    return res.status(200).send({ rasc, sale });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Erro ao buscar o Rascunho da NFE" });
  }
});

module.exports = (app) => app.use("/invoices", router);
