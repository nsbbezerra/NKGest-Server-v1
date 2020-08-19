const Funcionarios = require('../models/funcionarios');
const PlanoConta = require('../models/planoDeContas');
const ContaBancaria = require('../models/contasBancarias');

module.exports = {

    async init() {

        const funcionario = await Funcionarios.findOne({ name: 'Admin' });
        const planoConta = await PlanoConta.find();
        const contaBancaria = await ContaBancaria.find();

        if(!funcionario) {
            await Funcionarios.create({
                name: "Admin",
                gender: "masc",
                dateBirth: "00/00/0000",
                celOne: "00 00000-0000",
                celTwo: "00 00000-0000",
                email: "email@email.com",
                admin: true,
                sales: false,
                caixa: false,
                admission: "00/00/0000",
                comission: 0,
                user: "admin",
                password: "admin",
                cargo: "Administrador",
                comissioned: false
            });
            console.log('Criado FUNC');
        }

        if(!planoConta.length) {
            await PlanoConta.create({
                planoConta: 'PRESTAÇÃO DE SERVIÇO',
                typeMoviment: 'credit',
            });
            await PlanoConta.create({
                planoConta: 'VENDA DE PRODUTOS',
                typeMoviment: 'credit',
            });
            console.log('Criado PLANO CONTA');
        }
        if(!contaBancaria.length) {
            await ContaBancaria.create({
                bank: 'CAIXA MOVIMENTO',
                value: 0
            });
            console.log('Criado CONTA BANK');
        }
    }

}