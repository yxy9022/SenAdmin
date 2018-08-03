/**
 * Created by jerry on 2018/4/13.
 */
const config = require('../config');

let imageController = {};

imageController.get = function (req, res) {
  let filename = req.params.id || req.query.id;
  let imgt = req.query.imgt;

  if (filename && filename !== 'undefined') {
    //获取图片存放路径
    let orignImageFile = (imgt === 'avatar') ?
      $path.join(config.avatarPath, filename) : $path.join(config.imgPath, filename);
    if (!$fs.existsSync(orignImageFile)) {
      //如果图片不存在
      notFound(res);
      return;
    }
    //图片存在，读取文件
    $fs.readFile(orignImageFile, 'binary', function (err, file) {
      if (err) {
        console.log(err);
        notFound(res);
      } else {
        // console.log("输出文件");
        res.writeHead(200, {'Content-Type': 'image/png'});
        res.write(file, 'binary');
        res.end();
      }
    });
  } else {
    // console.error('没有这个文件【参数错误】？' + id);
    notFound(res);
  }

  function notFound(res) {
    res.header('Content-Type', 'image/jpeg');
    res.sendFile($path.join(config.publicPath, 'images', 'default.jpg'));
  }
};

module.exports = imageController;
