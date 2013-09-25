define('NodeContainerView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/nodes/container.html',
    'text!templates/nodes/containerModal.html',
    'text!templates/nodes/list.html',
    'NodeCollection'
], function($, _, Backbone, moment, tpl, tplModal, tplList, NodeCollection) {
    var NodeContainerView;

    NodeContainerView = Backbone.View.extend({
        initialize: function(modalCallback) {
            //var nodeList

            this.template = _.template(tpl);
            this.templateModal = _.template(tplModal);
            this.templateList = _.template(tplList);
            this.collection = new NodeCollection();
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
            "keyup #searchNode": "search",
            "click .selection": "seleccionaNodo"
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
             $('#searchNode').val(letters);
             $('#searchNode').focus();
             //console.log($('#searchNode'));
             return this;
             */
        },
        renderList: function(letters) {
            $("#nodeList").html("");

            var collectionRender = this.collection.search(letters);
            var tmpl = this.templateList({nodes: collectionRender.toJSON(), modal: this.modal});
            $("#nodeList").append(tmpl);
            $('#searchNode').val(letters);
            $('#searchNode').focus();
        },
        search: function(e) {
            e.preventDefault();
            var letters = $("#searchNode").val();
            this.renderList(letters);
        },
        seleccionaNodo: function(e) {
            if (this.modal) {
                e.preventDefault();
                var target = $(e.target).parent().get(0);
                var _nodeName = $(target).find('#_nodeName').get(0);
                var _nodeNameVal = $.trim($(_nodeName).html());
                $('#nodesContainerModal').modal('hide');
                this.modalCallBack(_nodeNameVal);
            }
        }
    });

    return NodeContainerView;
});
