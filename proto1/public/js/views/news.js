define('NewsView', [
  'jquery',
  'underscore',
  'backbone',
  'text!templates/news.html'
], function($, _, Backbone, tpl) {
  var NewsView;

  NewsView = Backbone.View.extend({
    initialize: function() {
      this.template = _.template(tpl);
    },
    render: function() {
      $(this.el).html(this.template());
      return this;
    }
  });

  return NewsView;
});
