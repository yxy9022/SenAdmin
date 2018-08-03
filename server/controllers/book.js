/**
 * Created by jerry on 2018/5/30.
 */
const ErrorCode = require('../tools/ErrorCode');
const utils = require('../tools/utils');
const dao = require('../dao/book');
const bookCategoryDao = require('../dao/book_category');

const controller = {};

/**
 * 获取书籍列表
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
    let book = await dao.findById(bookId, req.query.hasCategory);
    res.success(book);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

controller.add = async function (req, res) {
  try {
    if (!req.body.name || !req.body.isbn) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let cid = req.body.cid;
    let params = {
      name: req.body.name,
      summary: req.body.summary,
      translator: req.body.translator,
      author: req.body.author,
      publisher: req.body.publisher,
      publish_at: req.body.publish_at,
      isbn: req.body.isbn
    };
    let result = await dao.add(params);
    if (result && result.stmt && result.stmt.changes > 0) {
      let id = result.stmt.lastID;
      if (utils.isPositive(cid)) {
        await bookCategoryDao.save(id, cid);
      }
      res.success({id: id});
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
    if (!id || !req.body.name || !req.body.isbn) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let cid = req.body.cid;
    let params = {
      name: req.body.name,
      summary: req.body.summary,
      translator: req.body.translator,
      author: req.body.author,
      publisher: req.body.publisher,
      publish_at: req.body.publish_at,
      isbn: req.body.isbn
    };
    let result = await dao.update(id, params);
    if (result && result.stmt && result.stmt.changes > 0) {
      if (utils.isPositive(cid)) {
        await bookCategoryDao.save(id, cid);
      }
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
    await dao.deleteById(id);
    await bookCategoryDao.deleteById(id);
    res.success({id: id});
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

module.exports = controller;
