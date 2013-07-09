define('IndinetView', [
    'jquery',
    'underscore',
    'backbone',
    'text!templates/indinet.html'
], function($, _, Backbone, tpl) {
    var IndinetView;

    IndinetView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);
        },
        events: {
            'click ul.nav-tabs a': 'tabClicked',
        },
        tabClicked: function(e) {
            //console.log('js/views/indinet.js tabClicked 1');
            e.preventDefault();
            $(e.target).tab('show');
        },
        render: function() {
            $(this.el).html(this.template());
            return this;
        }
    });

    return IndinetView;
});
