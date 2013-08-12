define('NodeView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/nodes/show.html',
    'NodeModel'
], function($, _, Backbone, moment, tpl, Node) {
    var NodeView;

    NodeView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);
        },
        events: {
            "click .delete-btn": "removeNode",
        },
        render: function() {
            var that = this, tmpl;

            //console.log(this.model.toJSON());
            tmpl = that.template({node: this.model.toJSON()});
            $(that.el).html(tmpl);

            return this;
        },
        removeNode: function(e) {
            e.preventDefault();

            this.model.destroy({
                sync: true,
                success: function(model) {
                    model.trigger('delete-success');
                },
                error: function(model, res) {
                    if (res.status === 404) {
                        // TODO: handle 404 Not Found
                    } else if (res.status === 500) {
                        // TODO: handle 500 Internal Server Error
                    }
                }
            })
        }
    });

    return NodeView;
});
