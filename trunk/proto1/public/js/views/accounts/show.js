define('AccountView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/accounts/show.html',
    'AccountModel'
], function($, _, Backbone, moment, tpl, Account) {
    var AccountView;

    AccountView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);
        },
        events: {
            "click .delete-btn": "removeAccount",
        },
        render: function() {
            var that = this, tmpl;

            tmpl = that.template({account: this.model.toJSON()});
            $(that.el).html(tmpl);

            return this;
        },
        removeAccount: function(e) {
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

    return AccountView;
});
