var mongoose = require('mongoose');
var increment = require('mongoose-auto-increment');
var Schema = mongoose.Schema;
//increment.initialize(mongoose);
var commentSchema = new Schema({
  item : { type: 'Number', ref: 'Item' },
  content: {type: 'String', required: true},
  author: {type: 'String', required: true},
  datePublished: { type: 'Date', default: Date.now },
  isDisabled: { type: 'Boolean', default: false }
});
//commentSchema.plugin(increment.plugin, { model: 'Comment', startAt: 1 });
module.exports=mongoose.model('Comment', commentSchema);
