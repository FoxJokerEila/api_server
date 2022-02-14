const express = require('express')
const app = express()
const cors = require('cors')
const config = require('./config')
const expressJWT = require('express-jwt')

// 配置跨域和body解析中间件
app.use(cors())
app.use(express.urlencoded({ extended: false }))

// 自定义挂载错误方法
app.use(function (req, res, next) {
  res.cc = function (err, status = 1) {
    res.send({
      status,
      message: err instanceof Error ? err.message : err
    })
  }
  next()
})
// 解析token 检查是否过期 是否携带了token
app.use(expressJWT({ secret: config.jwtSecretKey, algorithms: ['HS256'] }).unless({ path: [/^\/api\//] }))
app.use('/uploads', express.static('./uploads'))
// 引入并注册路由
const userRouter = require('./router/user')
app.use('/api', userRouter)
const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)
const artCateRouter = require('./router/artcate')
app.use('/my/article', artCateRouter)
const articleRouter = require('./router/article')
app.use('/my/article', articleRouter)
// 错误级别中间件要位于路由之后
const joi = require('joi')
app.use(function (err, req, res, next) {
  if (err instanceof joi.ValidationError) { return res.cc(err) }
  if (err.name === 'UnauthorizedError') {
    return res.cc('身份认证失败！')
  }
  res.cc(err)
})
app.listen(8080, function () {
  console.log('api server is running at http://localhost:8080');
})