var mongoose = require('mongoose');
var increment = require('mongoose-auto-increment');
var slug = require('slug');
var schema = mongoose.Schema;
increment.initialize(mongoose);

var itemSchema = new schema({
  title: {type: 'String', required: true },
  permalink: {type: 'String', required: true},
  content: {type: 'String', required: true},
  author: {type: 'Number', required: true},
  datePublished: { type: 'Date', default: Date.now },
  images: [{
    title: {type: 'String', required: true},
    url: {type: 'String', required: true}
  }],
  comments: [{
    content: {type: 'String', required: true},
    author: {type: 'String', required: true},
    datePublished: { type: 'Date', default: Date.now }
  }]
});
itemSchema.plugin(increment.plugin, {model:'Item', startAt:1});
itemSchema.pre('save', function(next) {
  var item = this;
  if(!item.isModified('title')) {
    next();
  }
  item.permalink = slug(item.title);
  next();
  //this.update({},{ $set: { updatedAt: new Date() } });
});
module.exports=mongoose.model('Item', itemSchema);
