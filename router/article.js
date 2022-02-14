const express = require('express')
const router = express.Router()
const article_handler = require('../router_handler/article')
const multer = require('multer')
const path = require('path')
const upload = multer({ dest: path.join(__dirname, '../uploads') })

const expressJoi = require('@escook/express-joi')
const { add_article_schema } = require('../schema/article')
router.post('/add', upload.single('cover_img'), expressJoi(add_article_schema), article_handler.addArticle)

module.exports = router