define('RelationshipContainerView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/relationships/container.html',
    'text!templates/nodes/containerModal.html',
    'text!templates/relationships/list.html',
    'RelationshipCollection'
], function($, _, Backbone, moment, tpl, tplModal, tplList, RelationshipCollection) {
    var RelationshipContainerView;

    RelationshipContainerView = Backbone.View.extend({
        initialize: function(modalCallback) {
            //var relationshipList

            this.template = _.template(tpl);
            this.templateModal = _.template(tplModal);
            this.templateList = _.template(tplList);
            this.collection = new RelationshipCollection();
            this.getData();
            this.collection.bind("reset", this.render, this);
            this.collection.bind("sync", this.render, this);

            // setea si fue llamada al estilo modal
            if (typeof modalCallback === 'function') {
                this.modalCallBack = modalCallback;
                this.modal = true;
            } else {
                this.modalCallBack = null;
                this.modal = false;
            }

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
            if (!this.modal)
                $(this.el).html(this.template);
            else
                $(this.el).html(this.templateModal);
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

            var collectionRender = this.collection.search(letters);
            var tmpl = this.templateList({relationships: collectionRender.toJSON(), modal: this.modal});
            $("#relationshipList").append(tmpl);
            $('#searchRelationship').val(letters);
            $('#searchRelationship').focus();

        },
        search: function(e) {
            e.preventDefault();
            var letters = $("#searchRelationship").val();
            this.renderList(letters);
        },
        seleccionaNodo: function(e) {
            e.preventDefault();
            if (this.modal) {
                $('#relationshipsContainerModal').modal('hide');
                this.modalCallBack('relación recuperado');
            }
        }
    });

    return RelationshipContainerView;
});
