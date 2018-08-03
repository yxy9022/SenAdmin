/**
 * Created by jerry on 2018/7/16.
 */
const config = require('../config');
const ErrorCode = require('../tools/ErrorCode');
const formidable = require('formidable');
const imageSize = require('image-size');

let fileController = {};

// 文件上传
fileController.upload = function (req, res) {
  let form = new formidable.IncomingForm();
  form.uploadDir = config.tmpPath;    //上传目录
  form.keepExtensions = true; //保留后缀格式
  // form.maxFieldsSize = 2 * 1024 * 1024;       //文件大小
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err);
      return res.json(ErrorCode.CUSTOM_ERROR('图片上传失败'));
    }
    let f = files.file;
    let newpath = f.path.toLowerCase();
    if (newpath !== f.path) {
      $fs.renameSync(f.path, newpath);
    }

    //TODO 这里可以增加上传图片到云服务器逻辑

    let item = {
      size: f.size,
      url: $path.basename(newpath),
      ext: $path.extname(newpath),
      contentType: f.type
    };
    if (_.startsWith(f.type, 'image')) {
      let dimensions = imageSize(newpath);
      item.width = dimensions.width || 0;
      item.height = dimensions.height || 0;
    }
    res.success(item);
  });
  form.on('progress', (bytesReceived, bytesExpected) => {
    // console.log('progress: %d', Math.round((bytesReceived / bytesExpected) * 100));
  });
};


//文件下载
fileController.download = function (req, res) {
  // eeffe750-fcdc-4b1c-931b-80835efab92b.png
  let fileName = req.query.filename;
  if (!fileName) {
    return res.json(ErrorCode.CUSTOM_ERROR('资源不存在'));
  }
  let f = $path.join(config.imgPath, fileName);
  // console.log('Download file: %s', f);
  if ($fs.existsSync(f)) {
    res.download(f);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end('<h3>资源不存在<h3>');
  }

  //第二种方式
  // var path = "F:/ftproot/NW.js.docx";
  // var f = fs.createReadStream(path);
  // res.writeHead(200, {
  //   'Content-Type': 'application/force-download',
  //   'Content-Disposition': 'attachment; filename=NW.js.docx'
  // });
  // f.pipe(res);
};

module.exports = fileController;
