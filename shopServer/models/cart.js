const Sequelize = require('sequelize')
const sesquelize = require('../utils/sequelize')

//定义购物车
const Cart = sesquelize.define('cart',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false

    }
})
module.exports = Cart