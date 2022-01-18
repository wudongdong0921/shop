const Sequelize = require('sequelize')
const sequelize = require('../utils/sequelize')

//定义模型
const User = sequelize.define('user',{
     // 在这里定义模型属性
    id: {
        type: Sequelize.INTEGER,
        // autoIncrement 可用于创建 auto_incrementing 整数列
        autoIncrement: true,
         // 将 allowNull 设置为 false 将为该列添加 NOT NULL,
        // 这意味着如果该列为 null,则在执行查询时将从数据库引发错误.
        // 如果要在查询数据库之前检查值是否不为 null,请查看下面的验证部分.
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    email: Sequelize.STRING
});
module.exports = User