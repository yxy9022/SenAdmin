/**
 * Created by jerry on 2018/5/3.
 */
const ErrorCode = require('../tools/ErrorCode');

let dao = require('../dao/permission');
let controller = {};

controller.findAllForSelect = async function (req, res) {
  try {
    let result = await dao.findAllForSelect();
    res.success(result);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

controller.findList = async function (req, res) {
  try {
    let sname = req.query.sname;
    let data = await dao.findList(sname, 1, 1000);
    res.success(data);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

controller.findById = async function (req, res) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let data = await dao.findById(id);
    res.success(data);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

controller.add = async function (req, res) {
  try {
    if (!req.body.name || !req.body.code || !req.body.srvauth) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let params = {
      group: req.body.group,
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
      srvauth: req.body.srvauth
    };
    let result = await dao.add(params);
    if (result && result.stmt && result.stmt.changes > 0) {
      res.success({
        id: result.stmt.lastID
      });
    } else {
      res.fail();
    }
  } catch (ex) {
    console.log(ex);
    if (ex.code === 'SQLITE_CONSTRAINT' && ex.message.indexOf('permission.code') > -1) {
      res.json(ErrorCode.CUSTOM_ERROR('权限编码存在'));
      return;
    }
    res.json(ErrorCode.SERVER_ERROR);
  }
};

controller.update = async function (req, res) {
  try {
    const id = req.params.id;
    if (!id || !req.body.name || !req.body.srvauth) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let params = {
      group: req.body.group || null,
      name: req.body.name,
      description: req.body.description || null,
      srvauth: req.body.srvauth
    };
    let result = await dao.update(id, params);
    if (result && result.stmt && result.stmt.changes > 0) {
      res.success(Object.assign({id: result.stmt.lastID}, params));
    } else {
      res.fail();
    }
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

controller.delete = async function (req, res) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let data = await dao.findById(id);
    if (!data) {
      res.success({
        id: id
      });
      return;
    }
    let result = await dao.deleteById(id);
    if (result && result.stmt && result.stmt.changes > 0) {
      res.success({
        id: id
      });
    } else {
      res.fail();
    }
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};


module.exports = controller;
