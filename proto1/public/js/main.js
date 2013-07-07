requirejs.config({
    baseUrl:"js",
  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'bootstrap': {
      deps: ['jquery'],
      exports: 'bootstrap'
    }
  },
  /**
   * HACK:
   * Modified Underscore and Backbone to be AMD compatible (define themselves)
   * since it didn't work properly with the RequireJS shim when optimizing
   */
  paths: {
    'text'             : 'lib/text',
    'jquery'           : 'lib/jquery',
    'underscore'       : 'lib/underscore-amd',
    'backbone'         : 'lib/backbone-amd',
    'bootstrap'        : 'lib/bootstrap',
    'moment'           : 'lib/moment',
    'Mediator'         : 'lib/mediator',
    'App'              : 'App',
    'RouterHome'       : 'RouterHome',
    'RouterIndinet'    : 'RouterIndinet',
    'AttributeTypeModel'      : 'models/attributeType',
    'AttributeTypeCollection' : 'collections/attributeTypes',
    'HomeView'         : 'views/home',
    'NewsView'         : 'views/news',
    'HeaderView'       : 'views/header',
    'IndinetMenuView'       : 'views/indinetMenu',
    'IndinetView'      : 'views/indinet',
    'AttributeTypeListView'   : 'views/attributeTypes/index',
    'AttributeTypeEditView'   : 'views/attributeTypes/edit',
    'AttributeTypeView'       : 'views/attributeTypes/show'
  }
});

require(['App'], function(App, Client) {
  console.log("App: ", JSON.stringify(App));
  App.initialize();
});
