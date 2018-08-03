/**
 * Created by jerry on 2018/6/5.
 */
const ErrorCode = require('../tools/ErrorCode');
const utils = require('../tools/utils');
const dao = require('../dao/category');
const bookCategoryDao = require('../dao/book_category');
const controller = {};

controller.findAllForSelect = async function (req, res) {
  try {
    let result = await dao.findAllForSelect();
    res.success(result);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

/**
 * 获取书籍类别列表
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
controller.findList = async function (req, res) {
  try {
    let page = req.query.page;
    let limit = req.query.limit;
    let sname = req.query.sname;
    let data = await dao.findList(sname, page, limit);
    res.success(data);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

controller.findById = async function (req, res) {
  try {
    let bookId = req.params.id;
    if (!bookId) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let book = await dao.findById(bookId);
    res.success(book);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

controller.add = async function (req, res) {
  try {
    if (!req.body.name) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let params = {
      name: req.body.name,
      description: req.body.description
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
    if (ex.code === 'SQLITE_CONSTRAINT' && ex.message.indexOf('category.name') > -1) {
      res.json(ErrorCode.CUSTOM_ERROR('该类别名称已经存在'));
      return;
    }
    res.json(ErrorCode.SERVER_ERROR);
  }
};

controller.update = async function (req, res) {
  try {
    const id = req.params.id;
    if (!id || !req.body.name) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let params = {
      name: req.body.name,
      description: req.body.description || null
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
    if (!utils.isPositive(id)) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let row = await bookCategoryDao.findByCid(id);
    if (row) {
      res.json(ErrorCode.CUSTOM_ERROR('该类别名已经被使用，不能删除'));
      return;
    }
    await dao.deleteById(id);
    res.success({id: id});
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

module.exports = controller;
