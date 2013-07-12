define('AccountModel', [
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Account;

    Account = Backbone.Model.extend({
        idAttribute: "_id",
        urlRoot: "/api/v1/accounts",
        // set defaults for checking existance in the template for the new model
    });

    return Account;
});
