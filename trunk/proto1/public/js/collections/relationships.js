define('RelationshipCollection', [
    'jquery',
    'underscore',
    'backbone',
    'RelationshipModel'
], function($, _, Backbone, Relationship) {
    var RelationshipCollection;

    RelationshipCollection = Backbone.Collection.extend({
        model: Relationship,
        url: "api/v1/relationships",
        search: function(letters) {
            if (typeof letters === "undefined" || letters === "")
                return this;

            var pattern = new RegExp(letters, "gi");
            var filteredCollection = this.filter(function(data) {
                var relationship = data.toJSON();
                //console.log(node._node._data.data['tipo']);
                //console.log(node._node._data.data['nombre']);
                var retVal = relationship['fromNodeType'].match(pattern) || 
                        relationship['fromNodeName'].match(pattern) ||
                        relationship['_type'].match(pattern) ||
                        relationship['toNodeType'].match(pattern) ||
                        relationship['toNodeName'].match(pattern);
                //console.log('data:' + data.get("name") + ' retval: ' + retVal + ' letters: ' + letters);
                return retVal;
            });
            return new RelationshipCollection(filteredCollection);
        }
    });

    return RelationshipCollection;
});
