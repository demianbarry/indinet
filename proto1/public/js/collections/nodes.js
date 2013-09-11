define('NodeCollection', [
    'jquery',
    'underscore',
    'backbone',
    'NodeModel'
], function($, _, Backbone, Node) {
    var NodeCollection;

    NodeCollection = Backbone.Collection.extend({
        model: Node,
        url: "api/v1/nodes",
        search: function(letters) {
            if (typeof letters === "undefined" || letters === "")
                return this;

            var pattern = new RegExp(letters, "gi");
            var filteredCollection = this.filter(function(data) {
                var node = data.toJSON();
                //console.log(node._node._data.data['tipo']);
                //console.log(node._node._data.data['nombre']);
                var retVal = node._node._data.data['nombre'].match(pattern) || node._node._data.data['tipo'].match(pattern);
                //console.log('data:' + data.get("name") + ' retval: ' + retVal + ' letters: ' + letters);
                return retVal;
            });
            return new NodeCollection(filteredCollection);
        }
    });

    return NodeCollection;
});
