const express = require("express");
const router = express.Router();
const Clientes = require("../models/clientes");
const Funcionario = require("../models/funcionarios");
const Enderecos = require("../models/enderecos");
const Veiculos = require("../models/veiculos");
const Produtos = require("../models/produtos");
const Servicos = require("../models/servicos");
const PagamentoVendas = require("../models/pagamentosVendas");
const PagamentoServicos = require("../models/pagamentosServicos");
const Vendas = require("../models/ordens");
const Ordens = require("../models/ordenServico");
const dateFns = require("date-fns");

const Data = new Date();
const monthDate = Data.getMonth();
const yearDate = Data.getFullYear();
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

//teste
router.get("/teste", async (req, res) => {
  try {
    const status = "Conectado";

    return res.status(200).send({ status });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao conectar com o servidor" });
  }
});

//Autenticar
router.post("/auth", async (req, res) => {
  const { user, pass } = req.body;

  try {
    const funcionario = await Funcionario.findOne({ user: user }).select(
      "user password admin sales caixa name active"
    );

    if (funcionario.active === false) {
      return res.status(400).send({ message: "Funcionário não autorizado" });
    }

    if (!funcionario) {
      return res.status(400).send({ message: "Usuário não encontrado" });
    }

    if (pass !== funcionario.password) {
      return res.status(400).send({ message: "Senha inválida" });
    }

    return res.status(200).send({ funcionario });
  } catch (error) {
    return res.status(400).send({ message: "Erro na autenticação" });
  }
});

//Rota para buscar os clientes
router.get("/listClientes", async (req, res) => {
  try {
    const clientes = await Clientes.find().sort({ name: 1 });

    return res.status(200).send({ clientes });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar clientes" });
  }
});

//Rota para buscar funcionários
router.get("/findFuncionarios", async (req, res) => {
  try {
    const funcionarios = await Funcionario.find().sort({ name: 1 });

    return res.status(200).send({ funcionarios });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar funcionários" });
  }
});

//Rota para buscar funcionarios comissionados
router.get("/findFuncionariosComissioned", async (req, res) => {
  try {
    const funcionarios = await Funcionario.find({
      comissioned: true,
      active: true,
    }).sort({ name: 1 });

    return res.status(200).send({ funcionarios });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar funcionários" });
  }
});

//Rota para ativar/desativar clientes
router.put("/activeClients/:id", async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    await Clientes.findByIdAndUpdate(id, {
      $set: {
        active: active,
      },
    });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para ativar/desativar funcionários
router.put("/activeFunc/:id", async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    await Funcionario.findByIdAndUpdate(id, {
      $set: {
        active: active,
      },
    });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para restringir clientes
router.put("/restrictClients/:id", async (req, res) => {
  const { id } = req.params;
  const { restrict } = req.body;

  try {
    await Clientes.findByIdAndUpdate(id, {
      $set: {
        restrict: restrict,
      },
    });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para alterar estado do funcionário
router.put("/changeComission/:id", async (req, res) => {
  const { id } = req.params;
  const { comission } = req.body;

  try {
    await Funcionario.findByIdAndUpdate(id, {
      $set: {
        comission: comission,
      },
    });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para alterar os dados do funcionario
router.put("/changeFuncStatus/:id", async (req, res) => {
  const { id } = req.params;
  const {
    admin,
    sales,
    caixa,
    comission,
    user,
    password,
    cargo,
    comissioned,
  } = req.body;

  try {
    await Funcionario.findByIdAndUpdate(id, {
      $set: {
        admin: admin,
        sales: sales,
        caixa: caixa,
        comission: comission,
        comissioned: comissioned,
        user: user,
        password: password,
        cargo: cargo,
      },
    });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para alterar dados do funcinario
router.put("/changeFuncData/:id", async (req, res) => {
  const { id } = req.params;
  const { name, gender, dateBirth, celOne, celTwo, email } = req.body;

  try {
    await Funcionario.findByIdAndUpdate(id, {
      $set: {
        name: name,
        gender: gender,
        dateBirth: dateBirth,
        celOne: celOne,
        celTwo: celTwo,
        email: email,
      },
    });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para ativar / desativar funcionarios
router.put("/activeFunc/:id", async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    await Funcionario.findOneAndUpdate(id, {
      $set: {
        active: active,
      },
    });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para buscar os dados dos clientes por ID
router.get("/findClientsId/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const client = await Clientes.findOne({ _id: id });

    return res.status(200).send({ client });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para buscar endereços pelo ID do cliente
router.get("/findAddressId/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const endereco = await Enderecos.findOne({ client: id });

    return res.status(200).send({ endereco });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para buscar veículos pelo ID do cliente
router.get("/findVeicleId/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const veiculo = await Veiculos.find({ client: id });

    return res.status(200).send({ veiculo });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para editar dados do veículo
router.put("/editVeiculo/:id", async (req, res) => {
  const { id } = req.params;
  const { model, marca, placa, color, fuel, obs } = req.body;

  try {
    await Veiculos.findByIdAndUpdate(id, {
      $set: {
        model: model,
        marca: marca,
        placa: placa,
        color: color,
        fuel: fuel,
        obs: obs,
      },
    });

    return res.status(200).send({ message: "Atualizado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para atualizar o endereço
router.put("/editEndereco/:id", async (req, res) => {
  const { id } = req.params;
  const { street, number, comp, bairro, cep, city, state } = req.body;

  try {
    await Enderecos.findByIdAndUpdate(id, {
      $set: {
        street: street,
        number: number,
        comp: comp,
        bairro: bairro,
        cep: cep,
        city: city,
        state: state,
      },
    });

    return res.status(200).send({ message: "Atualizado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para editar os dados do cliente
router.put("/editCliente/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    cpf_cnpj,
    rg,
    emitter,
    dateBirth,
    email,
    socialName,
    stateRegistration,
    municipalRegistration,
    manager,
    phoneComercial,
    celOne,
    celTwo,
    obs,
  } = req.body;

  try {
    await Clientes.findByIdAndUpdate(id, {
      $set: {
        name: name,
        cpf_cnpj: cpf_cnpj,
        rg: rg,
        emitter: emitter,
        dateBirth: dateBirth,
        email: email,
        socialName: socialName,
        stateRegistration: stateRegistration,
        municipalRegistration: municipalRegistration,
        manager: manager,
        phoneComercial: phoneComercial,
        celOne: celOne,
        celTwo: celTwo,
        obs: obs,
      },
    });

    return res.status(200).send({ message: "Atualizado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para excluir Veículo
router.delete("/delVeiculo/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Veiculos.findByIdAndDelete(id);

    return res.status(200).send({ message: "Excluído com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para excluir Endereço
router.delete("/delEndereco/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Enderecos.findByIdAndDelete(id);

    return res.status(200).send({ message: "Excluído com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para busca avançada GESTAO DE CLIENTES
router.post("/buscaGestao", async (req, res) => {
  const { find } = req.body;

  try {
    if (find === 1) {
      const clientes = await Clientes.find({ active: true }).sort({ name: 1 });

      return res.status(200).send({ clientes });
    }

    if (find === 2) {
      const clientes = await Clientes.find({ active: false }).sort({ name: 1 });

      return res.status(200).send({ clientes });
    }

    if (find === 3) {
      const clientes = await Clientes.find({ restrict: true }).sort({
        name: 1,
      });

      return res.status(200).send({ clientes });
    }

    if (find === 4) {
      const clientes = await Clientes.find().sort({ name: 1 });

      return res.status(200).send({ clientes });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para listar os produtos
router.get("/findProducts", async (req, res) => {
  try {
    const products = await Produtos.find()
      .sort({ codiname: 1 })
      .populate({ path: "fornecedor", select: "name" });

    return res.status(200).send({ products });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para Listar os Produtos que precisam de alteração
router.get("/listProductsChanged", async (req, res) => {
  try {
    const produtos = await Produtos.find({ confirmStatus: true })
      .sort({ codiname: 1 })
      .populate({ path: "fornecedor", select: "name" });
    return res.status(200).send({ produtos });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para alterar as informações dos produtos
router.put("/changeInfoProduct/:id", async (req, res) => {
  const { id } = req.params;
  const {
    codiname,
    code,
    sku,
    codeUniversal,
    unMedida,
    description,
    cfop,
    ncm,
    cest,
    valueCusto,
    valueDiversos,
    valueSale,
    estoqueAct,
    icms,
    pis,
    cofins,
    margeLucro,
    markupFactor,
    modeCalc,
  } = req.body;
  const dataCadastro = dateFns.format(Data, "dd/MM/yyyy");

  try {
    await Produtos.findByIdAndUpdate(id, {
      $set: {
        codiname,
        code,
        sku,
        codeUniversal,
        unMedida,
        description,
        cfop,
        ncm,
        cest,
        valueCusto,
        valueDiversos,
        valueSale,
        estoqueAct,
        icms,
        pis,
        cofins,
        confirmStatus: false,
        createDate: dataCadastro,
        margeLucro: margeLucro,
        atualized: false,
        markupFactor,
        typeCalculate: modeCalc,
      },
    });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao alterar o produto" });
  }
});

//Rota para listar os serviços
router.get("/listService", async (req, res) => {
  try {
    const services = await Servicos.find().sort({ name: 1 });

    return res.status(200).send({ services });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao processar a requisição" });
  }
});

//Rota para alterar os serviços
router.put("/changeServiceInfo/:id", async (req, res) => {
  const { id } = req.params;
  const { name, value, description } = req.body;

  try {
    await Servicos.findByIdAndUpdate(id, {
      $set: {
        name,
        value,
        description,
      },
    });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao alterar o serviço" });
  }
});

//Rota para ativar / bloquear o serviço
router.put("/activeService/:id", async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    await Servicos.findByIdAndUpdate(id, { $set: { active } });

    return res.status(200).send({ message: "Alterado com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao alterar o serviço" });
  }
});

//Rota para listar os débitos
router.post("/listDebitsAll", async (req, res) => {
  const { find, client } = req.body;

  try {
    //BUSCA POR TODOS

    if (find === 1) {
      const produtos = await PagamentoVendas.find({
        statusPay: "wait",
        dateToPay: { $lte: Data },
      })
        .populate({ path: "cliente", select: "name" })
        .sort({ dateToPay: 1 });

      const servicos = await PagamentoServicos.find({
        statusPay: "wait",
        dateToPay: { $lte: Data },
      })
        .populate({ path: "cliente", select: "name" })
        .sort({ dateToPay: 1 });

      //** TOTAL VENDAS */

      var totalProdutos = produtos.filter((verify) => {
        return verify.value;
      });

      var calcTotalProdutos = totalProdutos.reduce((sum, verify) => {
        return sum + verify.value;
      }, 0);

      //** TOTAL SERVICOS */

      var totalServicos = servicos.filter((verify) => {
        return verify.value;
      });

      var calcTotalServicos = totalServicos.reduce((sum, verify) => {
        return sum + verify.value;
      }, 0);

      //* RESUMO TOTAL */
      const resultado = calcTotalProdutos + calcTotalServicos;

      return res.status(200).send({ produtos, servicos, resultado });
    }

    //BUSCAR POR CLIENTES

    if (find === 2) {
      const produtos = await PagamentoVendas.find({
        cliente: client,
        statusPay: "wait",
        dateToPay: { $lte: Data },
      })
        .populate({ path: "cliente", select: "name" })
        .sort({ dateToPay: 1 });

      const servicos = await PagamentoServicos.find({
        cliente: client,
        statusPay: "wait",
        dateToPay: { $lte: Data },
      })
        .populate({ path: "cliente", select: "name" })
        .sort({ dateToPay: 1 });

      //** TOTAL VENDAS */

      var totalProdutos = produtos.filter((verify) => {
        return verify.value;
      });

      var calcTotalProdutos = totalProdutos.reduce((sum, verify) => {
        return sum + verify.value;
      }, 0);

      //** TOTAL SERVICOS */

      var totalServicos = servicos.filter((verify) => {
        return verify.value;
      });

      var calcTotalServicos = totalServicos.reduce((sum, verify) => {
        return sum + verify.value;
      }, 0);

      //* RESUMO TOTAL */
      const resultado = calcTotalProdutos + calcTotalServicos;

      return res.status(200).send({ produtos, servicos, resultado });
    }
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar informações" });
  }
});

//Rota para listar as vendas e as ordens de serviço já concluídas
router.post("/findAllSalesAndOrders", async (req, res) => {
  const { find, client, mes, ano, number } = req.body;

  try {
    //Busca do mês atual
    if (find === 1) {
      const vendas = await Vendas.find({
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
        month: meses[monthDate],
        year: yearDate,
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
      }).populate({
        path: "planoDeConta funcionario client veicles",
        select:
          "name planoConta model street number bairro city state phoneComercial celOne",
      });

      return res.status(200).send({ vendas, ordens });
    }

    //Busca por Perídodo
    if (find === 2) {
      const vendas = await Vendas.find({
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
        month: mes,
        year: ano,
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
      }).populate({
        path: "planoDeConta funcionario client veicles",
        select:
          "name planoConta model street number bairro city state phoneComercial celOne",
      });

      return res.status(200).send({ vendas, ordens });
    }

    //Buscar todas por cliente
    if (find === 3) {
      const vendas = await Vendas.find({
        client: client,
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
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
      }).populate({
        path: "planoDeConta funcionario client veicles address",
        select:
          "name planoConta model street number bairro city state phoneComercial celOne",
      });

      return res.status(200).send({ vendas, ordens });
    }

    //Buscar todas por cliente e periodo
    if (find === 4) {
      const vendas = await Vendas.find({
        number: number,
        statuSales: "sale",
        waiting: "none",
        finish: "yes",
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
      }).populate({
        path: "planoDeConta funcionario client veicles",
        select:
          "name planoConta model street number bairro city state phoneComercial celOne",
      });

      return res.status(200).send({ vendas, ordens });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Erro ao buscar informações" });
  }
});

module.exports = (app) => app.use("/admin", router);
