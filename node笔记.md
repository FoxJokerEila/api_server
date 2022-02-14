# nodejs搭建后台 博客demo

## 目录结构：

- app.js

- config.js // Jwt加密密钥和jwt有效时间

- db // 数据库连接，导出的db对象可以执行sql语句

- router // 分类业务的路由，单独编辑，单独导出，汇聚于app.js中

- router_handler // 具体的每个路由的业务逻辑

- schema // 表单数据验证

- uploads // 上传的头像存储于此

## 入口文件 app.js

```js
const express = require("express")
const app = express()

// 配置跨域中间件
const cors = require("cors")
app.use(cors())

// 解析请求体的中间件 将数据挂载到 req.body 上
app.use(express.urlencoded({extended: false}))

// jwt确认中间件，如果过期了，或者是没传，就会报错
const config = require('./config')
const expressJWT = require("express-jwt")
app.use(expressJWT({secret: config.jwtSecretKey, algorithms: ['HS256']}).unless({path:[/^\/api\//]}))

// 静态资源挂载
app.use('/uploads', express.static('./uploads'))

// 挂在一个中间件 配置一个错误报告函数 用来封装报错
app.use(function (req, res, next) {
    res.cc = function (err, status = 1) {
    res.send({
        status,
        message: err instanceof Error ? err.message : err
    })
    }
})

// 引入该部分路由 进行配置
const userRouter = require('./router/user')
app.use('/api', useRouter)
// ...略去其他路由的配置

// 配置一个错误抓取函数，不符合格式验证的报错和jwt验证报错的都单独手写验证，其余的错误自动返回
app.use(function (err, req, res, next) {
    if (err instanceof joi.ValidationError) return res.cc(err)
    if (err.name === 'UnauthorizedError') {
        return res.cc('身份验证失败！')
    }
    res.cc(err)
})

// 监听端口 8080
app.listen(8080, function () {
    console.log('app is running at http://localhost:8080')
})
```

## 路由 router/****.js 以 user.js 为例

```js
const express = require('express')
const router = express.Router()

// 导入逻辑处理对象
const userHandler = require('../router_handler/user')

// 表单检验方法
const expressJoi = require('@escook/express-joi')
// 表单检验规则
const { reg_login_schema } = require('../schema/')

// 具体路由
router.post('/reguser', expressJoi(reg_login_schema), userHandler.regUser)
router.post('/login', expressJoi(reg_login_schema), userHandler.login)

module.exports = router
```

## 逻辑处理代码 router_handler/****.js 以 user.js 为例

```js
const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require()

exports.regUser = (req, res) => {
    // 由app.js中的express.urlencoded({extended: false})配置进行挂载
    const userinfo = req.body
    // 判空
    if (!userinfo.username || !userinfo.password) return res.cc('用户名或密码不能为空！')
    // 设计数据库命令 查看是否被占用
    const sql = `select * from ev_users where username = ?`
    // 执行命令
    db.query(sql, userinfo.username, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) return res.cc('用户名被占用，请更换其他用户名！')
        // 密码先进行加盐加密 然后存入数据库
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        // 将用户信息 插入数据库
        const sql = 'insert into ev_users set ?'
        db.query(sql, {username: userinfo.username, password: userinfo.password}, (err, results) => {
            if (err) return res.cc(err)
            if (result.affectedRows !== 1) return res.cc('用户注册失败，请稍后再试！')
            res.cc('注册成功！', 0)        
        })
    })
}

exports.login = (req, res) => {
    const userinfo = req.body
    const sql = `select * from ev_users where username = ?`
    db.query(sql, userinfo.username, function (err, result) {
        if (err) return res.cc(err)
        if (result.length !== 1) return res.cc('登陆失败，该用户不存在!')
        
        // 用 bcrypt 的 compareSync 方法判断密码的正确性
        const compareResult = bcrypt.compareSync(userinfo.password, result[0].password)
        if (!compareResult) return res.cc('用户名或密码错误，登陆失败！')
        // jwt不能存敏感信息
        const user = { ...result[0], password: '', user_pic: '' }
        // 制作jwt签名
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {
            expiresIn: config.expiresIn
        })
        res.send({ status: 0, message: '登陆成功！', token: 'Bearer ' + tokenStr })
    })
}
```

## 数据库连接器 db/index.js

```js
const mysql = require('mysql')
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '略略略',
    database: 'my_db_01'
})
module.exports = db
```

## 数据检验 schema/****.js 以 user.js 为例

```js
const joi = require('joi')
const username = joi.string().alphanum().min(1).required()
const password = joi.string().pattern(/^[\S]{6, 12}$/)

exports.reg_login_schema = {
    body: {
        username,
        password
    }
}
```

## 配置文件 config.js

```js
module.exports = {
    jwtSecretKey: 'snowt 9184',
    expiresIn: '10h'
}
```

## 其他配置：

- 数据库 mysql

- 数据库管理工具 MySql Workbench

- 请求发送工具 Postman

- npm、nodemon


