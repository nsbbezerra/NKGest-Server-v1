const mongoose = require("../../database/database");
const Schema = mongoose.Schema;

const ProdutoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  codiname: {
    //Nome para lançar nas vendas
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  sku: String,
  fornecedor: {
    type: Schema.Types.ObjectId,
    ref: "Fornecedores",
    required: true,
  },
  codeUniversal: {
    //Código de barras
    type: String,
  },
  unMedida: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  valueCusto: {
    type: Number,
    required: true,
  },
  valueDiversos: {
    type: Number,
  },
  valueSale: {
    type: Number,
    required: true,
  },
  frete: Number,
  estoqueAct: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
    required: true,
  },
  createDate: {
    type: String,
    required: true,
  },
  cfop: {
    type: String,
    required: true,
  },
  ncm: {
    type: String,
    required: true,
  },
  icms: {
    rate: Number,
    origin: String,
    csosn: String,
    icmsSTRate: Number,
    icmsMargemValorAddST: Number,
    icmsSTModBC: String,
    fcpRate: Number,
    fcpSTRate: Number,
    fcpRetRate: Number,
    ipiCst: String,
    ipiRate: Number,
    ipiCode: String,
  },
  pis: {
    rate: Number,
    cst: String,
  },
  cofins: {
    rate: Number,
    cst: String,
  },
  cest: {
    type: String,
  },
  confirmStatus: {
    type: Boolean,
    required: true,
    default: false, //(true) => precisa de alteração, (false) => não precisa
  },
  atualized: {
    type: Boolean,
    required: true,
    default: false,
  },
  margeLucro: Number,
  typeCalculate: {
    type: String,
    enum: ["markup", "margemBruta"],
  },
  markupFactor: {
    factor: Number,
    margeLucro: Number,
    comission: Number,
    otherExpenses: Number,
  },
});

const produtos = mongoose.model("Produtos", ProdutoSchema);

module.exports = produtos;
