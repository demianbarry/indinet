define('RelationshipContainerView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/relationships/container.html',
    'RelationshipCollection',
    'RelationshipListView'
], function($, _, Backbone, moment, tpl, RelationshipCollection, RelationshipListView) {
    var RelationshipContainerView;

    RelationshipContainerView = Backbone.View.extend({
        initialize: function() {
            //var relationshipList

            this.template = _.template(tpl);
            this.collection = new RelationshipCollection();
            this.getData();
            this.collection.bind("reset", this.render, this);

        },
        events: {
            "keyup #searchRelationship": "search"
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
             $('#searchRelationship').val(letters);
             $('#searchRelationship').focus();
             //console.log($('#searchRelationship'));
             return this;
             */
        },
        renderList: function(letters) {
            $("#relationshipList").html("");

            var view = new RelationshipListView();
            var collectionRender = this.collection.search(letters);
            $("#relationshipList").append(view.render(collectionRender).el);
            $('#searchRelationship').val(letters);
            $('#searchRelationship').focus();

        },
        search: function(e) {
            e.preventDefault();
            var letters = $("#searchRelationship").val();
            this.renderList(letters);
        }
    });

    return RelationshipContainerView;
});
