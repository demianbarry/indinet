define('AttributeTypeCollection', [
    'jquery',
    'underscore',
    'backbone',
    'AttributeTypeModel'
], function($, _, Backbone, AttributeType) {
    var AttributeTypeCollection;

    AttributeTypeCollection = Backbone.Collection.extend({
        model: AttributeType,
        url: "api/v1/attributeTypes",
        search: function(letters) {
            if (typeof letters === "undefined" || letters === "")
                return this;

            var pattern = new RegExp(letters, "gim");
            var filteredCollection = this.filter(function(data) {
                var retVal = pattern.test(data.get("name"));
                console.log('data:' + data.get("name") + ' ratval: ' + retVal);
                return retVal;
            });
            return new AttributeTypeCollection(filteredCollection);
        }
    });

    return AttributeTypeCollection;
});
