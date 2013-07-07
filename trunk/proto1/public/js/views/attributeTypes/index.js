define('AttributeTypeListView', [
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'text!templates/attributeTypes/index.html',
  'AttributeTypeCollection'
], function($, _, Backbone, moment, tpl, AttributeTypeCollection) {
  var AttributeTypeListView;

  AttributeTypeListView = Backbone.View.extend({
    initialize: function() {
      var attributeTypeList;

      this.template = _.template(tpl);
      this.collection = new AttributeTypeCollection();
    },
    getData: function(callback) {
      this.collection.fetch({
        success: function(collection) {
          callback(collection);
        },
        error: function(coll, res) {
          if (res.status === 404) {
            // TODO: handle 404 Not Found
          } else if (res.status === 500) {
            // TODO: handle 500 Internal Server Error
          }
        }
      });
    },
    // render template after data refresh
    render: function(callback) {
      var that = this, tmpl;

      this.getData(function(collection) {
        tmpl = that.template({ attributeTypes: collection.toJSON() });
        $(that.el).html(tmpl);

        callback();
      });
    }
  });

  return AttributeTypeListView;
});
