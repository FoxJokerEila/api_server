const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
exports.regUser = (req, res) => {
  const userinfo = req.body
  if (!userinfo.username || !userinfo.password) {
    return res.cc('用户名或密码不为空！')
  }
  const sql = `select * from ev_users where username = ?`
  db.query(sql, [userinfo.username], function (err, result) {
    if (err) {
      return res.cc(err.message)
    }
    if (result.length > 0) {
      return res.cc('用户名被占用，请更换其他用户名！')
    }
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)
    const sql1 = 'insert into ev_users set ?'
    db.query(sql1, { username: userinfo.username, password: userinfo.password }, function (err, result) {
      if (err) return res.cc(err.message)
      if (result.affectedRows !== 1) {
        return res.cc('用户注册失败，请稍后再试！')
      }
      res.cc('注册成功！', 0)
    })
  })
}

exports.login = (req, res) => {
  const userinfo = req.body
  const sql = `select * from ev_users where username=?`
  db.query(sql, userinfo.username, function (err, result) {
    if (err) return res.cc(err)
    if (result.length !== 1) return res.cc('登陆失败!')
    const compareResult = bcrypt.compareSync(userinfo.password, result[0].password)
    if (!compareResult) return res.cc('用户名或密码错误，登陆失败！')
    const user = { ...result[0], password: '', user_pic: '' }
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn: config.expiresIn
    })
    res.send({ status: 0, message: '登陆成功', token: 'Bearer ' + tokenStr })
  })
}