const Sequelize = require('sequelize')
const con = require('./config')
const sesquelize = new Sequelize(con.database,con.user,con.password,{
    dialect: 'mysql',
    host: con.host,
    port: con.port
})
module.exports = sesquelize