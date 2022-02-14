const db = require('../db/index')
exports.getUserInfo = (req, res) => {
  const sql = 'select id, username, nickname, email, user_pic from ev_users where id = ?'
  db.query(sql, req.user.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) return res.cc('获取用户信息失败！')
    res.send({
      status: 0,
      message: '获取用户基本信息成功！',
      data: results[0]
    })
  })
  // res.send('ok')
}

exports.updateUserInfo = (req, res) => {
  const sql = 'update ev_users set ? where id=?'
  db.query(sql, [req.body, req.user.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('修改用户信息失败！')
    return res.cc('修改用户信息成功', 0)
  })
  // res.send('ok')
}
const bcrypt = require('bcryptjs')
exports.updatePassword = (req, res) => {
  const sql = 'select * from ev_users where id = ?'
  db.query(sql, req.user.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) return res.cc('用户不存在！')
    const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)
    if (!compareResult) return res.cc('原密码错误！')
  })
  const sql1 = 'update ev_users set password = ? where id = ?'
  const newPwd = bcrypt.hashSync(req.body.newPwd, 10)
  db.query(sql1, [newPwd, req.user.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('重置密码失败！')
    res.cc('重置密码成功', 0)
  })
  // res.send('ok')
}

exports.updateAvatar = function (req, res) {
  const sql = 'update en_users set user_pic=? where id=?'
  db.query(sql, [req.body.avatar, req.user.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更新头像失败！')
    return res.cc('更新头像成功', 0)
  })
}