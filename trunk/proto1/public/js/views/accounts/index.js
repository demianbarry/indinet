define('AccountListView', [
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'text!templates/accounts/index.html',
  'AccountCollection'
], function($, _, Backbone, moment, tpl, AccountCollection) {
  var AccountListView;

  AccountListView = Backbone.View.extend({
    initialize: function() {
      this.template = _.template(tpl);
      this.collection = new AccountCollection();
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
        tmpl = that.template({ accounts: collection.toJSON() });
        $(that.el).html(tmpl);

        callback();
      });
    }
  });

  return AccountListView;
});
