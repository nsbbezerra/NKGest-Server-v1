const express = require('express');
const router = express.Router();
const ComissoeVendas = require('../models/comissions');

const DateNow = new Date();
const monthDate = DateNow.getMonth() + 1;
const yearDate = DateNow.getFullYear();
const meses = new Array('Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro');

//Buscar Comissões por vendedor
router.post('/findComissions', async (req, res) => {

    const { find, vendedor, mes, ano } = req.body;

    try {
        
        //** BUSCAR DO MÊS ATUAL */
        if(find === 1) {

            const comissionSale = await ComissoeVendas.find({ funcionario: vendedor, month: meses[monthDate -1 ], year: yearDate }).populate({ path: 'funcionario', select: 'name' }).sort({ createDate: 1 });

            //** CALCULO COMISSOES DE VENDAS */

            var totalSales = comissionSale.filter((verify) => {
                return verify.value;
            });
    
            var calcTotalSales = totalSales.reduce((sum, verify) => {
                return sum + verify.value;
            }, 0);

            return res.status(200).send({ comissionSale, calcTotalSales });

        }

        if(find === 2) {

            const comissionSale = await ComissoeVendas.find({ funcionario: vendedor, month: mes, year: ano }).populate({ path: 'funcionario', select: 'name' }).sort({ createDate: 1 });

            //** CALCULO COMISSOES DE VENDAS */

            var totalSales = comissionSale.filter((verify) => {
                return verify.value;
            });
    
            var calcTotalSales = totalSales.reduce((sum, verify) => {
                return sum + verify.value;
            }, 0);

            return res.status(200).send({ comissionSale, calcTotalSales });

        }

    } catch (error) {
        return res.status(400).send({ message: 'Erro ao buscar informações' });
    }

});

module.exports = app => app.use('/comissions', router);