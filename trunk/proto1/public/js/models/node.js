define('NodeModel', [
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Node;

    Node = Backbone.Model.extend({
        idAttribute: "_id",
        urlRoot: "/api/v1/nodes",
        // set defaults for checking existance in the template for the new model
    });

    return Node;
});
