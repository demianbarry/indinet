define('AttributeTypeListView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/attributeTypes/list.html',
    'AttributeTypeCollection'
], function($, _, Backbone, moment, tpl, AttributeTypeCollection) {
    var AttributeTypeListView;

    AttributeTypeListView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);
        },
        events: {
        },
        // render template after data refresh
        render: function(collectionRender) {
            var tmpl = this.template({attributeTypes: collectionRender.toJSON()});
            $(this.el).html(tmpl);
            return this;
        }
    });

    return AttributeTypeListView;
});
