// (async () => {
//     //
//     const mysql = require('mysql2/promise')
//     //连接设置
//     const cp = {
//         host: 'localhost',
//         port: '3308',
//         user: 'root',
//         password: 'wdd123',
//         database: 'test'
//     }
//     //配置连接
//     const connection = await mysql.createConnection(cp)
//     //建表
//     const CREATE_SQL = `CREATE TABLE IF NOT EXISTS test (
//         id INT NOT NULL AUTO_INCREMENT,
//         message VARCHAR(45) NULL,
//         infos VARCHAR(45) NULL,
//         PRIMARY KEY (id))`;
//     let ret = await connection.execute(CREATE_SQL)

//     //插入
//     const INSERT_SQL = `INSERT INTO test(message,infos) VALUES(?,?)`
//     let = await connection.execute(INSERT_SQL, ['wdd','hjhjj'])
//     //查
//     const SELECT_SQL = `SELECT * FROM test`
//     const [rows,fields] =await connection.execute(SELECT_SQL)
//     console.log(rows,fields)

// })()

//Sequelize  面向对象  ---  可以通过调用对象方式调用数据库
(async () => {
    const Sequelize = require("sequelize");
    // 建⽴连接
    const sequelize = new Sequelize("test", "root", "wdd123", {
        host: "localhost",
        port: '3308',
        dialect: "mysql",
        operatorsAliases: false //  仍可通过传⼊ operators map ⾄ operatorsAliases 的⽅式来使⽤字符串运算符，但会返回弃⽤警告
    });
    // 定义模型
    const Fruit = sequelize.define("Fruit", {
        name: {
            type: Sequelize.STRING(20),
            allowNull: false
            // 将 allowNull 设置为 false 将为该列添加 NOT NULL,
            // 这意味着如果该列为 null,则在执行查询时将从数据库引发错误.
            // 如果要在查询数据库之前检查值是否不为 null,请查看下面的验证部分.
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        stock: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    });
    // 同步数据库，force: true则会删除已存在表
    let ret = await Fruit.sync()//await Fruit.sync({force: true})
    console.log('sync', ret)
    ret = await Fruit.create({
        name: "苹果",
        price: 3.5
    })
    console.log('create', ret)
    ret = await Fruit.findAll()
    //找到香蕉变4
    await Fruit.update({
        price: 5
    }, {
        where: {
            name: '⾹蕉'
        }
    })

    console.log('findAll', JSON.stringify(ret))
    const Op = Sequelize.Op;
    ret = await Fruit.findAll({
        // where: { price: { [Op.lt]:4 }, stock: { [Op.gte]: 100 } }
        where: {
            price: {
                [Op.lt]: 4,
                [Op.gt]: 2
            }
        }
    })
    console.log('findAll', JSON.stringify(ret, '', '\t'))

})()