var tmpdir = './files';
var Item = require('../models/item')
   ,File = require('../models/file')
   ,path = require('path')
   ,fs = require('fs')
   ,Busboy = require('busboy')
	 ,express = require('express')
   ,gm = require('gm').subClass({imageMagick: true})
   ,im = require('imagemagick')
   ,async = require('async')
	 ,router=express.Router();

router.route('/upload')
.get(function(req, res){

})
.options(function(req,res){
	console.log('OPTIONS');
	res.status(200).send();
})
.post(function(req, res) {
  var busboy = new Busboy({ headers: req.headers });
  var newfile = new File();
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      newfile['filename'] = filename;
      newfile['mimetype'] = mimetype;
      newfile.save(function(err) {
        if(err) console.log(err);
        else {
          var saveTo = path.join(tmpdir, path.basename(newfile._id));
          file.pipe(fs.createWriteStream(saveTo));
          var imgFormat = undefined;
          gm(saveTo).format(function(err, value){
            imgFormat = value; // note : value may be undefined
          });
          async.parallel([
            function(){
              im.crop({
                srcPath: saveTo,
                dstPath: path.join(tmpdir, path.basename('th_'+newfile._id)),
                width: 320,
                height: 150,
                quality: 0.9,
                gravity: "North"
              }, function(err, stdout, stderr){
                if (err) console.log(err); 
                else console.log('TH '+newfile._id+' done!');
              });
            },
            function(){
              im.crop({
                srcPath: saveTo,
                dstPath: path.join(tmpdir, path.basename('rs_'+newfile._id)),
                width: 800,
                height: 300,
                quality: 0.9,
                gravity: "North"
              }, function(err, stdout, stderr){
                if (err) console.log(err); 
                else console.log('RS '+newfile._id+' done!');
              });
            }
            ], function() {
              console.log('Image processing completed!');
            });
        }
      });
    });
    busboy.on('finish', function() {
      //res.writeHead(200, { 'Connection': 'close' });
      //console.log(newfile);
        res.send({ status: 'success', savedFile: newfile });
    });
    return req.pipe(busboy);
});
router.route('/:id')
.get(function(req, res) {
  var kind = ( req.query.kind == undefined ) ? '' : req.query.kind + '_';
  //res.setHeader('Content-disposition', 'attachment; filename="' + file._id + '"');
  var filepath = path.join(tmpdir, path.basename(kind + req.params.id));
  var filestream = fs.createReadStream(filepath, {
        'bufferSize': 4 * 1024
  })
  .on('readable', function() {
        //res.setHeader('Content-type', file.mimetype);
        filestream.pipe(res);
  })
  .on('error', function(){
    //res.sendStatus(404);// HTTP status 404: NotFound
    var response = fs.createReadStream(path.join(tmpdir, path.basename(kind + 'noimage.png')))
    .on('readable', function() {
          response.pipe(res);
    });
  });
})
.delete(function(req,res){
  if(req.params.id == undefined) res.sendStatus(404);
  File.remove({_id: req.params.id}, function(err, file) {
    if(err) {
      res.sendStatus(500);
    }
    var filePath = 
    [
    path.join(tmpdir, path.basename(req.params.id)),
    path.join(tmpdir, path.basename('rs_'+req.params.id)),
    path.join(tmpdir, path.basename('th_'+req.params.id))
    ]; 
    filePath.forEach(function(file, index, filePath) {
      fs.exists(file, function(exists) {
        if(exists) {
          fs.unlink(file, function() {
            console.log(file+' was removed');
          });
        }
      });
    });
    res.json({status: 'OK', message: 'File was successfuly removed'})
  });
})
.options(function(req, res) {
  res.sendStatus(200);
});
module.exports = router;

