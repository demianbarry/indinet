define('AttributeTypeCollection', [
  'jquery',
  'underscore',
  'backbone',
  'AttributeTypeModel'
], function($, _, Backbone, AttributeType) {
  var AttributeTypeCollection;

  AttributeTypeCollection = Backbone.Collection.extend({
    model : AttributeType,
    url   : "api/v1/attributeTypes"
  });

  return AttributeTypeCollection;
});
