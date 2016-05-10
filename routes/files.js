var tmpdir = './files';
var Item = require('../models/item')
   ,File = require('../models/file')
   ,path = require('path')
   ,fs = require('fs')
   ,Busboy = require('busboy')
	 ,express = require('express')
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
  File.findOne({_id: req.params.id})
  .exec(function(err, file) {
    var filepath = path.join(tmpdir, path.basename(req.params.id));
    //res.setHeader('Content-disposition', 'attachment; filename="' + file._id + '"');
    res.setHeader('Content-type', file.mimetype);
    var filestream = fs.createReadStream(filepath);
    filestream.pipe(res);
  });
});
module.exports = router;

