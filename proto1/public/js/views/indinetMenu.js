define('IndinetMenuView', [
    'jquery',
    'underscore',
    'backbone',
    'text!templates/indinetMenu.html'
], function($, _, Backbone, tpl) {
    var IndinetMenuView;

    IndinetMenuView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);
        },
        render: function() {
            $(this.el).html(this.template());
            return this;
        },
        select: function(item) {
            $('.nav li').removeClass('active');
            $('.' + item).addClass('active');
        }
    });

    return IndinetMenuView;
});

