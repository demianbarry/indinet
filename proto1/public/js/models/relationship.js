define('RelationshipModel', [
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Relationship;

    Relationship = Backbone.Model.extend({
        idAttribute: "_id",
        urlRoot: "/api/v1/relationships",
        // set defaults for checking existance in the template for the new model
    });

    return Relationship;
});
