var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fileSchema = new Schema({
  mimetype: {type: 'String', required: true },
  filename: {type: 'String', required: true},
  //author: {type: Schema.Types.ObjectId, required: true},
  datePublished: { type: 'Date', default: Date.now }
});
module.exports=mongoose.model('File', fileSchema);