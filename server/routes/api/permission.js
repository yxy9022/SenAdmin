/**
 * Created by jerry on 2018/5/3.
 */
const express = require('express');
const router = express.Router();
const indexRouter = {};
const userController = require('../../controllers/user');
const permissionController = require('../../controllers/permission');

//先检查登录
router.use(userController.checkLogin);

router.get('/all', userController.checkAuth, permissionController.findAllForSelect);

// 约定权限管理功能只能role===1的使用
router.use(userController.setBuiltin);

router.get('/findlist', userController.checkAuth, permissionController.findList);

router.get('/find/:id', userController.checkAuth, permissionController.findById);

router.post('/add', userController.checkAuth, permissionController.add);

router.post('/update/:id', userController.checkAuth, permissionController.update);

router.all('/delete/:id', userController.checkAuth, permissionController.delete);

indexRouter.router = router;

module.exports = indexRouter;
