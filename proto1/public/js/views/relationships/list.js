define('RelationshipListView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/relationships/list.html',
    'RelationshipCollection'
], function($, _, Backbone, moment, tpl, RelationshipCollection) {
    var RelationshipListView;

    RelationshipListView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);
        },
        events: {
        },
        // render template after data refresh
        render: function(collectionRender) {
            var tmpl = this.template({relationships: collectionRender.toJSON()});
            $(this.el).html(tmpl);
            return this;
        }
    });

    return RelationshipListView;
});
