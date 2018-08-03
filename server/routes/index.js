const express = require('express');
const router = express.Router();
const indexRouter = {};

const imageController = require('../controllers/image');
const imageMiddleware = require('../middleware/image');

//接口访问
router.use('/api', require('./api/index').router);

//获取图片
router.get('/image/:id', imageMiddleware.setImageTypeDefault, imageController.get);
router.get('/avatar/:id', imageMiddleware.setImageTypeAvatar, imageController.get);

/* 服务端主页 */
router.get('/', function (req, res) {
  res.render('index');
});

indexRouter.router = router;

module.exports = indexRouter;
