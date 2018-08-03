/**
 * Created by jerry on 2018/04/10.
 *
 * users 控制器
 */
const url = require('url');
const utils = require('../tools/utils');
const ErrorCode = require('../tools/ErrorCode');
const config = require('../config');
const uuidv4 = require('uuid/v4');

const userDao = require('../dao/user');
const userPermissionDao = require('../dao/user_permission');
const userController = {};

/**
 * 检查用户的登录状态
 * @param req
 * @param res
 * @param next
 */
userController.checkLogin = function (req, res, next) {
  //用户已经登录
  if (req.session.userId) {
    next();
  }
  else {
    res.json(ErrorCode.NO_LOGIN);
  }
};

userController.checkAuth = function (req, res, next) {
  if (req.session.user) {
    let requrl = $path.join(req.baseUrl, req.route.path);
    // console.log(req.session.user.srvAuths);
    // console.log(requrl);
    if (req.session.user.role === 1 || (!req.superRole && req.session.user.srvAuths.indexOf(requrl) > -1)) {
      next();
    } else {
      res.json(ErrorCode.NO_AUTH);
    }
  } else {
    res.json(ErrorCode.NO_LOGIN);
  }

};

userController.setBuiltin = function (req, res, next) {
  req.superRole = true;
  next();
};

/**
 * 用户登录
 * @param req
 * @param res
 */
userController.login = async function (req, res) {
  let username = _.trim(req.query.username || req.body.username || '');
  let passwd = req.body.passwd;

  if (!username || !passwd) {
    return res.json(ErrorCode.INVALID_PARA);
  }
  try {
    let user = await userDao.findByUserName(username, true);
    if (!user) {
      return res.json(ErrorCode.NO_USER);
    }
    let crpasswd = utils.md5(passwd + user.salt);
    if (user.passwd !== crpasswd) {
      // 密码错误
      return res.json(ErrorCode.PASSWORD_ERROR);
    }

    //获取用户的权限
    const auths = await userPermissionDao.findPermissionsById(user.id);
    //创建要返回的用户信息
    const info = createUserObj(user);
    info.permissions = auths.map(function (item) {
      return item.code;
    });

    //后端权限
    const srvAuths = (auths.map(function (item) {
      return item.srvauth;
    })).toString().split(',');

    //设置session
    req.session.userId = user.id;
    req.session.user = Object.assign({srvAuths: srvAuths}, info);
    //返回数据
    return res.success(info);
  } catch (ex) {
    console.log(ex);
    return res.json(ErrorCode.SERVER_ERROR);
  }
};

/***
 * 重新加载用户信息（前端刷新时使用）
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
userController.reload = async function (req, res) {
  if (!req.session.userId) {
    return res.json(ErrorCode.INVALID_PARA);
  }
  try {
    const user = await userDao.findById(req.session.userId);
    const info = createUserObj(user);

    const auths = await userPermissionDao.findPermissionsById(user.id);
    info.permissions = auths.map(function (item) {
      return item.code;
    });
    return res.success(info);
  } catch (ex) {
    console.log(ex);
    return res.json(ErrorCode.SERVER_ERROR);
  }
};

/**
 * 退出登录
 * @param req
 * @param res
 */
userController.logout = function (req, res) {
  req.session.destroy();
  res.json(ErrorCode.OK);
};

/**
 * 修改个人部分信息
 * @param req
 * @param res
 */
userController.profile = async function (req, res) {
  if (!req.session.userId) {
    return res.json(ErrorCode.INVALID_PARA);
  }
  let userId = req.session.userId;
  if (req.method === 'POST') {
    // TODO 修改用户自己的信息，未开发
    res.fail();
  } else {
    let user = await userDao.findById(userId);
    res.success(user);
  }
};

/**
 * 修改密码
 * @param req
 * @param res
 */
userController.changepwd = function (req, res) {
  //TODO 未开发
  res.fail();
};

/**
 * 获取用户列表
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
userController.findList = async function (req, res) {
  try {
    let page = req.query.page;
    let limit = req.query.limit;
    let sname = req.query.sname;
    let data = await userDao.findList(sname, page, limit);
    res.success(data);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

/**
 * 用户更新头像
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
userController.updateAvatar = async function (req, res) {
  let avatar = req.body.avatar || '';
  if (!req.session.userId || !avatar) {
    return res.json(ErrorCode.INVALID_PARA);
  }
  let userId = req.session.userId;
  try {
    let user = await userDao.findById(userId);
    if (!user) {
      return res.json(ErrorCode.NO_USER);
    }
    // 过滤data:URL
    let base64Data = avatar.replace(/^data:image\/\w+;base64,/, '');
    // 新建Buffer
    let dataBuffer = Buffer.from(base64Data, 'base64');
    let avatarUrl = uuidv4().replace(/-/g, '') + '.png'; // 图片名称
    let avatarFullUrl = $path.join(config.avatarPath, avatarUrl); // 图片全路径
    // 保存base64编码图片到磁盘上
    $fs.writeFileSync(avatarFullUrl, dataBuffer);
    // 更新数据库
    let result = await userDao.updateAvatar(userId, avatarUrl);
    if (result && result.stmt && result.stmt.changes > 0) {
      //更新成功
      if (user.avatar_url) {
        // 删除用户旧头像
        let oldAvatarFullUrl = $path.join(config.avatarPath, user.avatar_url); // 旧头像的图片全路径
        if ($fs.existsSync(oldAvatarFullUrl)) {
          $fs.unlinkSync(oldAvatarFullUrl);
        }
      }
      user.avatar_url = avatarUrl;
      return res.success(createUserObj(user));
    } else {
      res.fail();
    }
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

/***
 * 删除某个用户
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
userController.delete = async function (req, res) {
  try {
    let userId = req.params.id;
    if (!userId) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let user = await userDao.findById(userId);
    if (!user) {
      return res.json(ErrorCode.NO_USER);
    }
    if (user.role === 1 || user.role === 2) {
      return res.json(ErrorCode.NO_AUTH);
    }
    let result = await userDao.deleteById(userId);
    if (result && result.stmt && result.stmt.changes > 0) {
      res.success({
        id: userId
      });
    } else {
      res.fail();
    }
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

/**
 * 根据id获取一个用户的信息
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
userController.findById = async function (req, res) {
  try {
    let userId = req.params.id;
    if (!userId) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let user = await userDao.findById(userId);
    if (!user) {
      return res.json(ErrorCode.NO_USER);
    }
    if (req.query.hasAuth) {
      const auths = await userPermissionDao.findPermissionsById(userId);
      user.permissions = auths.map(function (item) {
        return item.code;
      });
    }
    res.success(user);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

/**
 * 添加用户
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
userController.add = async function (req, res) {
  try {
    if (!req.body.username || !req.body.nickname) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let user = {
      nickname: req.body.nickname,
      username: req.body.username,
      email: req.body.email || null,
      mobile: req.body.mobile || null
    };
    let result = await userDao.add(user);
    if (result && result.stmt && result.stmt.changes > 0) {
      res.success({
        id: result.stmt.lastID
      });
    } else {
      res.fail();
    }
  } catch (ex) {
    console.log(ex);
    if (ex.code === 'SQLITE_CONSTRAINT' && ex.message.indexOf('user.username') > -1) {
      res.json(ErrorCode.CUSTOM_ERROR('该用户名已经存在'));
      return;
    }
    if (ex.code === 'SQLITE_CONSTRAINT' && ex.message.indexOf('user.mobile') > -1) {
      res.json(ErrorCode.CUSTOM_ERROR('该手机号已经存在'));
      return;
    }
    if (ex.code === 'SQLITE_CONSTRAINT' && ex.message.indexOf('user.email') > -1) {
      res.json(ErrorCode.CUSTOM_ERROR('该电子邮箱已经存在'));
      return;
    }
    res.json(ErrorCode.SERVER_ERROR);
  }
};

//更新用户信息
userController.update = async function (req, res) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let user = {
      nickname: req.body.nickname,
      username: req.body.username,
      email: req.body.email || null,
      mobile: req.body.mobile || null
    };
    let result = await userDao.update(id, user);
    if (result && result.stmt && result.stmt.changes > 0) {
      res.success(Object.assign({id: result.stmt.lastID}, user));
    } else {
      res.fail();
    }
  } catch (ex) {
    console.log(ex);
    if (ex.code === 'SQLITE_CONSTRAINT' && ex.message.indexOf('user.username') > -1) {
      res.json(ErrorCode.CUSTOM_ERROR('该用户名已经存在'));
      return;
    }
    if (ex.code === 'SQLITE_CONSTRAINT' && ex.message.indexOf('user.mobile') > -1) {
      res.json(ErrorCode.CUSTOM_ERROR('该手机号已经存在'));
      return;
    }
    if (ex.code === 'SQLITE_CONSTRAINT' && ex.message.indexOf('user.email') > -1) {
      res.json(ErrorCode.CUSTOM_ERROR('该电子邮箱已经存在'));
      return;
    }
    res.json(ErrorCode.SERVER_ERROR);
  }
};

/***
 * 保存用户权限
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
userController.saveAuth = async function (req, res) {
  try {
    if (!req.body.uid) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let result = await userPermissionDao.saveAuth(req.body.uid, req.body.codes);
    if (result && result.errcode === 0) {
      res.success();
    } else {
      res.fail();
    }
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

function createUserObj(user) {
  return {
    id: user.id,
    nickname: user.nickname,
    username: user.username,
    email: user.email,
    avatar: user.avatar_url ? url.resolve(config.hostname, '/avatar/' + user.avatar_url) : '',
    role: user.role
  };
}

module.exports = userController;
