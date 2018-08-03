/**
 * Created by jerry on 2018/7/16.
 */
const express = require('express');
const router = express.Router();
const indexRouter = {};
const userController = require('../../controllers/user');
const controller = require('../../controllers/file');

//先检查登录
router.use(userController.checkLogin);
router.post('/upload', userController.checkAuth, controller.upload);

router.get('/download', userController.checkAuth, controller.download);

indexRouter.router = router;

module.exports = indexRouter;
