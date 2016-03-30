var mongoose = require('mongoose');
//var increment = require('mongoose-auto-increment');
var Schema = mongoose.Schema;
//increment.initialize(mongoose);
var rateSchema = new Schema({
  item : { type: 'Number', ref: 'Item' },
  value: {type: 'Number', required: true},
  datePublished: { type: 'Date', default: Date.now },
  ipaddress: {type: 'String', required: true}
});
//commentSchema.plugin(increment.plugin, { model: 'Comment', startAt: 1 });
module.exports=mongoose.model('Rate', rateSchema);
