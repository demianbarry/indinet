define('NodeContainerView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/nodes/container.html',
    'NodeCollection',
    'NodeListView'
], function($, _, Backbone, moment, tpl, NodeCollection, NodeListView) {
    var NodeContainerView;

    NodeContainerView = Backbone.View.extend({
        initialize: function() {
            //var nodeList

            this.template = _.template(tpl);
            this.collection = new NodeCollection();
            this.getData();
            this.collection.bind("reset", this.render, this);

        },
        events: {
            "keyup #searchNode": "search"
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
             $('#searchNode').val(letters);
             $('#searchNode').focus();
             //console.log($('#searchNode'));
             return this;
             */
        },
        renderList: function(letters) {
            $("#nodeList").html("");

            var view = new NodeListView();
            var collectionRender = this.collection.search(letters);
            $("#nodeList").append(view.render(collectionRender).el);
            $('#searchNode').val(letters);
            $('#searchNode').focus();

        },
        search: function(e) {
            e.preventDefault();
            var letters = $("#searchNode").val();
            this.renderList(letters);
        }
    });

    return NodeContainerView;
});
