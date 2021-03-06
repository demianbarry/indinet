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

            var pattern = new RegExp(letters, "gi");
            var filteredCollection = this.filter(function(data) {
                var retVal = data.get("name").match(pattern);
                //console.log('data:' + data.get("name") + ' retval: ' + retVal + ' letters: ' + letters);
                return retVal;
            });
            return new AttributeTypeCollection(filteredCollection);
        }
    });

    return AttributeTypeCollection;
});
