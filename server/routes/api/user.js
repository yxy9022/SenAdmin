/**
 * Created by jerry on 2017/11/13.
 * users相关路由
 */
const express = require('express');
const router = express.Router();
const indexRouter = {};
const userController = require('../../controllers/user');

//用户登录
router.post('/login', userController.login);
//用户退出
router.all('/logout', userController.logout);

//先检查登录
router.use(userController.checkLogin);

//用户更新个人头像
router.post('/avatar/save', userController.updateAvatar);

//获取个人部分信息
router.all('/profile', userController.profile);

//重新获取个人信息
router.all('/reload', userController.reload);

//用户修改个人密码
router.post('/changepwd', userController.changepwd);

// 约定用户管理功能只能role===1的使用
router.use(userController.setBuiltin);

//返回user的集合
router.get('/findlist', userController.checkAuth, userController.findList);

//返回指定的user
router.get('/find/:id', userController.checkAuth, userController.findById);

//删除一个用户
router.all('/delete/:id', userController.checkAuth, userController.delete);

//创建user
router.post('/add', userController.checkAuth, userController.add);

//更新一个用户的信息
router.post('/update/:id', userController.checkAuth, userController.update);

//更新一个用户的权限信息
router.post('/auth/save', userController.checkAuth, userController.saveAuth);

indexRouter.router = router;

module.exports = indexRouter;
