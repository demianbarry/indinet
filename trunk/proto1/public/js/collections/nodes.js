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
                var retVal = data.get("nombre").match(pattern);
                //console.log('data:' + data.get("name") + ' retval: ' + retVal + ' letters: ' + letters);
                return retVal;
            });
            return new NodeCollection(filteredCollection);
        }
    });

    return NodeCollection;
});
