define('RelationshipView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/relationships/show.html',
    'RelationshipModel'
], function($, _, Backbone, moment, tpl, Relationship) {
    var RelationshipView;

    RelationshipView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);
        },
        events: {
            "click .delete-btn": "removeRelationship",
        },
        render: function() {
            var that = this, tmpl;

            //console.log(this.model.toJSON());
            tmpl = that.template({relationship: this.model.toJSON()});
            $(that.el).html(tmpl);

            return this;
        },
        removeRelationship: function(e) {
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

    return RelationshipView;
});
