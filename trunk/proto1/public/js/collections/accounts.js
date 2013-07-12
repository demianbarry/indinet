define('AccountCollection', [
  'jquery',
  'underscore',
  'backbone',
  'AccountModel'
], function($, _, Backbone, Account) {
  var AccountCollection;

  AccountCollection = Backbone.Collection.extend({
    model : Account,
    url   : "api/v1/accounts"
  });

  return AccountCollection;
});
