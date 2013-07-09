define('App', [
  'jquery',
  'underscore',
  'backbone',
  'RouterHome',
  'RouterIndinet',
  'bootstrap'
], function($, _, Backbone, RouterHome, RouterIndinet) {

  function initialize() {
    app = new RouterHome();
    indinet = new RouterIndinet();

    Backbone.history.start();
  }

  // TODO: error handling with window.onerror
  // http://www.slideshare.net/nzakas/enterprise-javascript-error-handling-presentation

  return {
    initialize: initialize
  };
});
