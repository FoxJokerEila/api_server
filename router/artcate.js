const express = require('express');
const router = express.Router();
const artcate_handler = require('../router_handler/artcate')

router.get('/cates', artcate_handler.getArtCates)
const expressJoi = require('@escook/express-joi')
const { add_cate_schema } = require('../schema/artcate')
router.post('/addcates', expressJoi(add_cate_schema), artcate_handler.addArticleCates)
const { delete_cate_schema } = require('../schema/artcate')
router.get('/deletecate/:id', expressJoi(delete_cate_schema), artcate_handler.deleteCateById)
const { get_cate_schema } = require('../schema/artcate')
router.get('/cates/:id', expressJoi(get_cate_schema), artcate_handler.getArtCateById)
const { update_cate_schema } = require('../schema/artcate')
router.post('/updatecate', expressJoi(update_cate_schema), artcate_handler.updateCateById)
module.exports = router
