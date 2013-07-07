define('AttributeTypeView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/attributeTypes/show.html',
    'AttributeTypeModel'
], function($, _, Backbone, moment, tpl, Client) {
    var AttributeTypeView;

    AttributeTypeView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);
        },
        events: {
            "click .delete-btn": "removeAttributeType",
        },
        render: function() {
            var that = this, tmpl;

            tmpl = that.template({attributeType: this.model.toJSON()});
            $(that.el).html(tmpl);

            return this;
        },
        removeAttributeType: function(e) {
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

    return AttributeTypeView;
});
