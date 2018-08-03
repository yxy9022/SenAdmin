/**
 * Created by jerry on 2018/7/12.
 */
const express = require('express');
const router = express.Router();
const indexRouter = {};
const userController = require('../../controllers/user');
const controller = require('../../controllers/picture');

//先检查登录
router.use(userController.checkLogin);

router.get('/findgrid', userController.checkAuth, controller.findGrid);

router.get('/find/:id', userController.checkAuth, controller.findById);

router.post('/add', userController.checkAuth, controller.add);

router.post('/update/:id', userController.checkAuth, controller.update);

router.all('/delete/:id', userController.checkAuth, controller.delete);

indexRouter.router = router;

module.exports = indexRouter;
