define('NodeListView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/nodes/list.html',
    'NodeCollection'
], function($, _, Backbone, moment, tpl, NodeCollection) {
    var NodeListView;

    NodeListView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);
        },
        events: {
        },
        // render template after data refresh
        render: function(collectionRender) {
            var tmpl = this.template({nodes: collectionRender.toJSON()});
            $(this.el).html(tmpl);
            return this;
        }
    });

    return NodeListView;
});
