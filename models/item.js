var mongoose = require('mongoose');
var increment = require('mongoose-auto-increment');
var slug = require('slug');
var Schema = mongoose.Schema;
increment.initialize(mongoose);
//console.log(slug('Мій перший та самий улюблений пост').toLowerCase());
var itemSchema = new Schema({
  title: {type: 'String', required: true },
  permalink: {type: 'String'},
  content: {type: 'String', required: true},
  author: {type: 'Number', required: true},
  price: {type: 'Number', default: 0},
  datePublished: { type: 'Date', default: Date.now },
  images: [{
    title: {type: 'String', required: true},
    url: {type: 'String', required: true}
  }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  rates: [{ type: Schema.Types.ObjectId, ref: 'Rate' }]
});
itemSchema.plugin(increment.plugin, { model: 'Item', startAt: 1 });
itemSchema.pre('save', function(next) {
  var item = this;
  if(!item.isModified('title')) {
    next();
  }
  item.permalink = slug(item.title).toLowerCase();
  next();
});
module.exports=mongoose.model('Item', itemSchema);
