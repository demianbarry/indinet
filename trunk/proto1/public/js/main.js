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
    'bootstrap-multivalue' : 'lib/bootstrap-multivalue',
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
    'AttributeTypeListView'   : 'views/attributeTypes/list',
    'AttributeTypeContainerView'   : 'views/attributeTypes/container',
    'AttributeTypeEditView'   : 'views/attributeTypes/edit',
    'AttributeTypeView'       : 'views/attributeTypes/show',
    'AccountListView'   : 'views/accounts/index',
    'AccountEditView'   : 'views/accounts/edit',
    'AccountView'       : 'views/accounts/show',
    'AccountModel'      : 'models/account',
    'AccountCollection' : 'collections/accounts',
    'NodeContainerView'   : 'views/nodes/container',
    'NodeEditView'   : 'views/nodes/edit',
    'NodeView'       : 'views/nodes/show',
    'NodeModel'      : 'models/node',
    'NodeCollection' : 'collections/nodes',
    'RelationshipContainerView'   : 'views/relationships/container',
    'RelationshipEditView'   : 'views/relationships/edit',
    'RelationshipView'       : 'views/relationships/show',
    'RelationshipModel'      : 'models/relationship',
    'RelationshipCollection' : 'collections/relationships'
  }
});

require(['App'], function(App, Client) {
  //console.log("App: ", JSON.stringify(App));
  App.initialize();
});
