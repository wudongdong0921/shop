const Sequelize = require('sequelize')
const sesquelize = require('../utils/sequelize')

const Order = sesquelize.define('order',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})
module.exports = Order