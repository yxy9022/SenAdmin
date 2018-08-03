/**
 * Created by jerry on 2018/7/12.
 */
const ErrorCode = require('../tools/ErrorCode');
const utils = require('../tools/utils');
const config = require('../config');
const dao = require('../dao/picture');
const url = require('url');
const controller = {};

/**
 *
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
controller.findGrid = async function (req, res) {
  try {
    let skip = req.query.offset;
    let limit = req.query.limit;
    let tag = req.query.tag;
    let data = await dao.findGrid(tag, skip, limit);

    // 增加图片全路径属性
    _.forEach(data.items, function (item) {
      item.fullUrl = url.resolve(config.hostname, `/image/${item.url}`);
    });
    res.success(data);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

/**
 * 获取一条记录
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
controller.findById = async function (req, res) {
  try {
    let pictureId = req.params.id;
    if (!pictureId) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let data = await dao.findById(pictureId);
    if (data && data.url) {
      data.fullUrl = url.resolve(config.hostname, `/image/${data.url}`);
    }
    res.success(data);
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

/**
 * 增加图片
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
controller.add = async function (req, res) {
  try {
    if (!req.body.pictures || !req.body.tags) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    let pictures = req.body.pictures;
    _.forEach(pictures, function (pic) {
      // 移动图片
      let curPath = $path.join(config.tmpPath, pic.url);
      let newname = pic.url.replace('upload_', ''); // 去掉upload_前缀
      let newPath = $path.join(config.imgPath, newname);
      $fs.renameSync(curPath, newPath);
      pic.url = newname;
    });
    let result = await dao.add(pictures, req.body.tags);
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

/**
 * 更新图片
 * @param req
 * @param res
 * @returns {Promise.<void>}
 */
controller.update = async function (req, res) {
  try {
    const id = req.params.id;
    let tag = req.body.tag;
    if (!id || !tag) {
      return res.json(ErrorCode.INVALID_PARA);
    }
    if (Array.isArray(tag)) {
      tag = tag.join();
    }
    let params = {
      tag: tag
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

    let data = await dao.findById(id);
    let filename = data && data.url;
    // 清除数据
    await dao.deleteById(id);

    if (filename) {
      let f = $path.join(config.imgPath, filename);
      if ($fs.existsSync(f)) {
        //从磁盘上删除图片
        $fs.unlink(f, function (err, message) {
          if (err) {
            console.log('delete file faild: %s', f);
            console.log(err);
          }
        });
      }
    }
    res.success({id: id});
  } catch (ex) {
    console.log(ex);
    res.json(ErrorCode.SERVER_ERROR);
  }
};

module.exports = controller;
