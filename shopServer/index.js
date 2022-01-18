

const Koa = require('koa')
const app = new Koa()
const cors = require('koa2-cors')
const bodyParser = require('koa-bodyparser')
app.use(require('koa-static')(__dirname + '/'))
app.use(bodyParser())
const router = require('koa-router')()
// 初始化数据库
const sequelize = require('./utils/sequelize');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const proxy = require('http-proxy-middleware')
const OrderItem = require('./models/order-item');
app.use(
    cors({
        origin: function(ctx) { //设置允许来自指定域名请求
            return ctx.header.origin; //只允许http://localhost:8080这个域名的请求
        },
        maxAge: 5, //指定本次预检请求的有效期，单位为秒。
        credentials: true, //是否允许发送Cookie
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
    })
  );
// 加载用户 - 代替鉴权
app.use(async (ctx, next) => {
    console.log('=======112===================',ctx)
    // ctx.set('Access-Control-Allow-Origin', 'http://192.168.0.114:3000');
    // ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    // ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    // ctx.set('Content-Type", "application/json;charset=utf-8');
    const user = await User.findByPk(1)
    
    ctx.user = user;
    await next();
});


router.get('/admin/products', async (ctx, next) => {
    // const products = await ctx.user.getProducts()
    const products = await Product.findAll()
    ctx.body = { prods: products }
})

router.post('/admin/product', async ctx => {
    const body = ctx.request.body
    const res = await ctx.user.createProduct(body)
    ctx.body = { success: true }
})

router.delete('/admin/product/:id', async (ctx, next) => {
    const id = ctx.params.id
    const res = await Product.destroy({
        where: {
            id
        }
    })
    ctx.body = { success: true }
})

router.get('/cart', async ctx => {
    const cart = await ctx.user.getCart()
    const products = await cart.getProducts()
    ctx.body = { products }
})
/**
 * 添加购物车
 */
router.post('/cart', async ctx => {
    const body = ctx.request.body
    //console.log('ctx.body', ctx.request.body)
    const prodId = body.id;
    let fetchedCart;
    let newQty = 1;

    // 获取购物车
    const cart = await ctx.user.getCart()
    //console.log('cart', cart)
    fetchedCart = cart;
    const products = await cart.getProducts({
        where: {
            id: prodId
        }
    });

    let product;
    // 判断购物车数量
    if (products.length > 0) {
        product = products[0];
    }
    if (product) {
        const oldQty = product.cartItem.quantity;
        newQty = oldQty + 1;
        //console.log("newQty", newQty);
    } else {
        product = await Product.findByPk(prodId);
    }

    await fetchedCart.addProduct(product, {
        through: {
            quantity: newQty
        }
    });
    ctx.body = { success: true }
})

router.post('/orders', async ctx => {
    let fetchedCart;
    const cart = await ctx.user.getCart();
    fetchedCart = cart;
    const products = await cart.getProducts();
    const order = await ctx.user.createOrder();
    const result = await order.addProducts(
        products.map(p => {
            p.orderItem = {
                quantity: p.cartItem.quantity
            };
            return p;
        })
    );
    await fetchedCart.setProducts(null);
    ctx.body = { success: true }
})
router.delete('/cartItem/:id', async ctx => {
    const id = ctx.params.id
    const cart = await ctx.user.getCart()
    const products = await cart.getProducts({
        where: { id }
    })
    const product = products[0]
    await product.cartItem.destroy()
    ctx.body = { success: true }
})
router.get('/orders', async ctx => {
    const orders = await ctx.user.getOrders(
        {
            include: [
                // 简单外联
                'products'
                // 复杂外联举例
                // {
                //     model: Product,
                //     as: 'products',
                //     attributes: [
                //         'id',
                //         'title'
                //     ],
                //     where: {
                //         'title': 'A'
                //     }
                // }
            ],

            order: [
                // ['id', 'DESC']
                ['createdAt', 'DESC']

            ]
        })
    ctx.body = { orders }
})


app.use(router.routes())
//创建一个 一对一 关系, hasOne 和 belongsTo 关联一起使用;
//创建一个 一对多 关系, hasMany he belongsTo 关联一起使用;
//创建一个 多对多 关系, 两个 belongsToMany 调用一起使用
// app.use('/admin', adminRoutes.routes);
// app.use(shopRoutes);

//存在外键依赖  constraints：true   存在一对一关系，外键在源模型中定义（Product）
//Product属于User
Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
});
//User有多个Product  存在一对多关系  外键在目标模型Product中定义
User.hasMany(Product);


//User有一个Cart  User和Cart之间存在一对一关系，外键在目标模型Cart中定义
User.hasOne(Cart);
//Cart属于user
Cart.belongsTo(User);

//多对多  通过CartItem表建立联系
//Cart属于多个Product 通过联结表CartItem   自动创建此模型CartItem（除非已经存在）并在其上定义适当的外键
Cart.belongsToMany(Product, {
    through: CartItem
});
//Product属于多个Cart 通过联结表CartItem
Product.belongsToMany(Cart, {
    through: CartItem
});


//Order 属于 User
Order.belongsTo(User);
//User有多个Order
User.hasMany(Order);


//Order属于多个Product 通过联结表OrderItem
Order.belongsToMany(Product, {
    through: OrderItem
});
//Produc属于多个Order 通过联结表OrderItem
Product.belongsToMany(Order, {
    through: OrderItem
});
//一次同步所有模型
sequelize.sync().then(
    async result => {
        let user = await User.findByPk(1)
        if (!user) {
            user = await User.create({
                name: 'Sourav',
                email: 'sourav.dey9@gmail.com'
            })
            await user.createCart();
        }
        app.listen(3000, () => console.log("Listening to port 3000"));
    })