define('HeaderView', [
  'jquery',
  'underscore',
  'backbone',
  'text!templates/header.html'
], function($, _, Backbone, tpl) {
  var HeaderView;

  HeaderView = Backbone.View.extend({
    initialize: function() {
      var ajaxLoader;

      this.template = _.template(tpl);

      $('body').ajaxStart(function() {
        ajaxLoader = ajaxLoader || $('.ajax-loader');
        ajaxLoader.show();
      }).ajaxStop(function() {
        ajaxLoader.fadeOut('fast');
      });
    },
     events: {
        "click #loginButton": "login"
    },
    render: function() {
      $(this.el).html(this.template());
      return this;
    },
    select: function(item) {
      $('.nav li').removeClass('active');
      $('.' + item).addClass('active');
    },
    login: function() {
      $.post('/login', {
        username: $('input[name=username]').val(),
        password: $('input[name=password]').val()
      }, function(data) {
        console.log(data);
      }).error(function(){
        $("#error").text('Imposible entrar.');
        $("#error").slideDown();
      });
      return false;
    }
  });

  return HeaderView;
});
