const express = require("express");
const router = express.Router();
const Clients = require("../models/clientes");
const Enderecos = require("../models/enderecos");
const Fornecedores = require("../models/fornecedores");
const Funcionarios = require("../models/funcionarios");
const Produtos = require("../models/produtos");
const Servicos = require("../models/servicos");
const Veiculos = require("../models/veiculos");
const dateFns = require("date-fns");

const DateNow = new Date();
const day = DateNow.getDate();
const month = DateNow.getMonth();
const year = DateNow.getFullYear();

//Cadastro de clientes
router.post("/clientes", async (req, res) => {
  const {
    name,
    cpf_cnpj,
    rg,
    emitter,
    dateBirth,
    email,
    typeClient,
    socialName,
    stateRegistration,
    municipalRegistration,
    manager,
    phoneComercial,
    celOne,
    celTwo,
    obs,
    comissioned,
  } = req.body;

  const dataCadastro = dateFns.format(new Date(year, month, day), "dd/MM/yyyy");

  const findCpf = await Clients.findOne({ cpf_cnpj: cpf_cnpj });

  const findName = await Clients.findOne({ name: name });

  if (findName) {
    return res
      .status(400)
      .send({ message: "Já existe um cliente com este nome cadastrado" });
  }

  if (findCpf) {
    return res
      .status(400)
      .send({ message: "Já existe um CPF/CNPJ cadastrado" });
  }

  try {
    const clients = await Clients.create({
      name: name,
      cpf_cnpj: cpf_cnpj,
      rg: rg,
      emitter: emitter,
      dateBirth: dateBirth,
      email: email,
      typeClient: typeClient,
      socialName: socialName,
      stateRegistration: stateRegistration,
      municipalRegistration: municipalRegistration,
      manager: manager,
      phoneComercial: phoneComercial,
      celOne: celOne,
      celTwo: celTwo,
      obs: obs,
      createDate: dataCadastro,
      comissioned: comissioned,
    });

    return res.status(200).send({ clients });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao cadastrar cliente" });
  }
});

//Cadastrar endereços
router.post("/enderecos", async (req, res) => {
  const {
    client,
    street,
    number,
    comp,
    bairro,
    cep,
    city,
    state,
    obs,
  } = req.body;

  try {
    await Enderecos.create({
      client: client,
      street: street,
      number: number,
      comp: comp,
      bairro: bairro,
      cep: cep,
      city: city,
      state: state,
      obs: obs,
    });

    return res.status(200).send({ message: "Cadastrado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao cadastrar endereço" });
  }
});

//Cadastrar Fornecedores
router.post("/fornecedores", async (req, res) => {
  const {
    name,
    cpf_cnpj,
    rg,
    emitter,
    dateBirth,
    email,
    typeClient,
    socialName,
    stateRegistration,
    typeTaxPayer,
    municipalRegistration,
    manager,
    phoneComercial,
    celOne,
    celTwo,
    obs,
    cep,
    city,
    state,
  } = req.body;

  const dataCadastro = dateFns.format(new Date(year, month, day), "dd/MM/yyyy");

  const findCpf = await Fornecedores.findOne({ cpf_cnpj: cpf_cnpj });

  const findName = await Fornecedores.findOne({ name: name });

  if (findName) {
    return res
      .status(400)
      .send({ message: "Já existe um fornecedor com este nome cadastrado" });
  }

  if (findCpf) {
    return res
      .status(400)
      .send({ message: "Já existe um CPF/CNPJ cadastrado" });
  }

  try {
    const fornecedores = await Fornecedores.create({
      name: name,
      cpf_cnpj: cpf_cnpj,
      rg: rg,
      emitter: emitter,
      dateBirth: dateBirth,
      email: email,
      typeClient: typeClient,
      socialName: socialName,
      stateRegistration: stateRegistration,
      typeTaxPayer: typeTaxPayer,
      municipalRegistration: municipalRegistration,
      manager: manager,
      phoneComercial: phoneComercial,
      celOne: celOne,
      celTwo: celTwo,
      obs: obs,
      cep: cep,
      city: city,
      state: state,
      createDate: dataCadastro,
    });

    return res.status(200).send({ fornecedores });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao cadastrar fornecedor" });
  }
});

//Cadastro de Funcionários
router.post("/funcionarios", async (req, res) => {
  const {
    name,
    gender,
    dateBirth,
    celOne,
    celTwo,
    email,
    admin,
    sales,
    caixa,
    admission,
    comission,
    user,
    password,
    cargo,
    comissioned,
  } = req.body;

  const funcionario = await Funcionarios.findOne({ name: name });

  const findName = await Funcionarios.findOne({ name: name });

  const findUser = await Funcionarios.findOne({ user: user });

  if (findUser) {
    return res.status(400).send({ message: "Usuário já cadastrado" });
  }

  if (findName) {
    return res
      .status(400)
      .send({ message: "Já existe um funcionário com este nome cadastrado" });
  }

  if (funcionario) {
    return res
      .status(400)
      .send({ message: "Este funcionário já está cadastrado" });
  }

  try {
    await Funcionarios.create({
      name: name,
      gender: gender,
      dateBirth: dateBirth,
      celOne: celOne,
      celTwo: celTwo,
      email: email,
      admin: admin,
      sales: sales,
      caixa: caixa,
      admission: admission,
      comission: comission,
      user: user,
      password: password,
      cargo: cargo,
      comissioned: comissioned,
    });

    return res.status(200).send({ message: "Cadastrado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao cadastrar funcionário" });
  }
});

//Cadastro de Produtos
router.post("/produtos", async (req, res) => {
  const {
    name,
    sku,
    fornecedor,
    code,
    codeUniversal,
    unMedida,
    description,
    valueCusto,
    valueDiversos,
    valueSale,
    estoqueAct,
    active,
    cfop,
    ncm,
    icms,
    pis,
    cofins,
    cest,
    margeLucro,
    markupFactor,
  } = req.body;

  const dataCadastro = dateFns.format(new Date(year, month, day), "dd/MM/yyyy");

  const findName = await Produtos.findOne({ name: name });

  const findCode = await Produtos.findOne({ code: code });

  if (findName) {
    return res.status(400).send({ message: "Produto já cadastrado" });
  }

  if (findCode) {
    return res.status(400).send({ message: "Este código já está cadastrado" });
  }

  try {
    await Produtos.create({
      name: name,
      codiname: name,
      code: code,
      fornecedor: fornecedor,
      codeUniversal: codeUniversal,
      unMedida: unMedida,
      description: description,
      valueCusto: valueCusto,
      valueDiversos: valueDiversos,
      valueSale: valueSale,
      sku: sku,
      estoqueAct: estoqueAct,
      active: active,
      createDate: dataCadastro,
      cfop,
      ncm,
      icms,
      pis,
      cofins,
      cest,
      margeLucro: margeLucro,
      markupFactor,
    });

    return res.status(200).send({ message: "Cadastrado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao cadastrar o produto" });
  }
});

//Cadastro de Serviços
router.post("/servicos", async (req, res) => {
  const { name, value, active, description } = req.body;

  const dataCadastro = dateFns.format(new Date(year, month, day), "dd/MM/yyyy");

  const servico = await Servicos.findOne({ name: name });

  const findName = await Servicos.findOne({ name: name });

  if (findName) {
    return res
      .status(400)
      .send({ message: "Já existe um serviço com este nome cadastrado" });
  }

  if (servico) {
    return res.status(400).send({ message: "Este serviço já está cadastrado" });
  }

  try {
    await Servicos.create({
      name: name,
      value: value,
      active: active,
      description,
      createDate: dataCadastro,
    });

    return res.status(200).send({ message: "Cadastrado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao cadastrar o serviço" });
  }
});

//Cadastrar Veículo
router.post("/veiculos", async (req, res) => {
  const { client, model, marca, placa, color, fuel, obs } = req.body;

  try {
    await Veiculos.create({
      client: client,
      model: model,
      marca: marca,
      placa: placa,
      color: color,
      fuel: fuel,
      obs: obs,
    });

    return res.status(200).send({ message: "Cadastrado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao cadastrar o veículo" });
  }
});

//Rota para listar os clientes
router.get("/listClientes", async (req, res) => {
  try {
    const clientes = await Clients.find().sort({ name: 1 }).select("name");

    return res.status(200).send({ clientes });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar clientes" });
  }
});

//Rota para listar os Fornecedores
router.get("/listFornecedores", async (req, res) => {
  try {
    const fornecedores = await Fornecedores.find().sort({ name: 1 });

    return res.status(200).send({ fornecedores });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar os fornecedores" });
  }
});

//Buscar veículos por cliente
router.get("/findVeicles/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const veicles = await Veiculos.find({ client: id });

    return res.status(200).send({ veicles });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar os veículos" });
  }
});

module.exports = (app) => app.use("/register", router);
