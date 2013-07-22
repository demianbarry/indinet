define('AttributeTypeListView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/attributeTypes/index.html',
    'AttributeTypeCollection'
], function($, _, Backbone, moment, tpl, AttributeTypeCollection) {
    var AttributeTypeListView;

    AttributeTypeListView = Backbone.View.extend({
        initialize: function() {
            var attributeTypeList

            this.template = _.template(tpl);
            this.collection = new AttributeTypeCollection();
            this.getData();
            this.collection.bind("reset", this.render, this);

        },
        events: {
            "keyup #searchAttributeType": "search"
        },
        getData: function() {

            this.collection.fetch({
                success: function() {
                    return true;
                },
                error: function(coll, res) {
                    if (res.status === 404) {
                        // TODO: handle 404 Not Found
                    } else if (res.status === 500) {
                        // TODO: handle 500 Internal Server Error
                    }
                }
            });
        },
        // render template after data refresh
        render: function(letters) {
            var collectionRender = this.collection.search(letters);
            var tmpl = this.template({attributeTypes: collectionRender.toJSON()});
            $(this.el).html(tmpl);
            $('#searchAttributeType').val(letters);
            $('#searchAttributeType').focus();
            return this;
        },
        search: function(e) {
            var letters = $("#searchAttributeType").val();
            this.render(letters);
        }
    });

    return AttributeTypeListView;
});
