define('AttributeTypeContainerView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/attributeTypes/container.html',
    'AttributeTypeCollection',
    'AttributeTypeListView'
], function($, _, Backbone, moment, tpl, AttributeTypeCollection, AttributeTypeListView) {
    var AttributeTypeContainerView;

    AttributeTypeContainerView = Backbone.View.extend({
        initialize: function() {
            //var attributeTypeList

            this.template = _.template(tpl);
            this.collection = new AttributeTypeCollection();
            this.getData();
            this.collection.bind("reset", this.render, this);

        },
        events: {
            "keyup .search-query": "search"
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
        render: function(data) {
            $(this.el).html(this.template);
            this.renderList("");
            return this;
            /*
             var collectionRender = this.collection.search(letters);
             var tmpl = this.template();
             $(this.el).html(tmpl);
             $('#searchAttributeType').val(letters);
             $('#searchAttributeType').focus();
             //console.log($('#searchAttributeType'));
             return this;
             */
        },
        renderList: function(letters) {
            $("#attributeList").html("");

            var view = new AttributeTypeListView();
            var collectionRender = this.collection.search(letters);
            $("#attributeList").append(view.render(collectionRender).el);
            $('#searchAttributeType').val(letters);
            $('#searchAttributeType').focus();

        },
        search: function(e) {
            e.preventDefault();
            var letters = $("#searchAttributeType").val();
            this.renderList(letters);
        }
    });

    return AttributeTypeContainerView;
});
