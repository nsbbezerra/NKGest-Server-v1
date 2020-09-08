const express = require("express");
const router = express.Router();
const Balancete = require("../models/balancete");

//Rota para listar os balancetes
router.get("/list", async (req, res) => {
  try {
    const balanco = await Balancete.find({ anual: false }).sort({
      dateSave: 1,
    });

    return res.status(200).send({ balanco });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar informações" });
  }
});

//Rota para listar os balancetes anuais
router.get("/listAnual", async (req, res) => {
  try {
    const balanco = await Balancete.find({ anual: true }).sort({ dateSave: 1 });

    return res.status(200).send({ balanco });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar informações" });
  }
});

//Rota para apagar o balancete
router.delete("/del/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Balancete.findByIdAndDelete(id);

    return res.status(200).send({ message: "Excluído com sucesso" });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao excluir o balancete" });
  }
});

//Rota para listar o último gerado
router.get("/lastGer", async (req, res) => {
  try {
    const balanco = await Balancete.find({ anual: false })
      .sort({ $natural: -1 })
      .limit(1);

    return res.status(200).send({ balanco });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar informações" });
  }
});

//Rota para listar o último gerado anual
router.get("/lastGerAnual", async (req, res) => {
  try {
    const balanco = await Balancete.find({ anual: true })
      .sort({ $natural: -1 })
      .limit(1);

    return res.status(200).send({ balanco });
  } catch (error) {
    return res.status(400).send({ message: "Erro ao buscar informações" });
  }
});

module.exports = (app) => app.use("/balancete", router);
