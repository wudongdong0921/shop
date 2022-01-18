const Sequelize = require('sequelize')
const sequelize = require('../utils/sequelize')

const Product = sequelize.define('product',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})
module.exports = Product