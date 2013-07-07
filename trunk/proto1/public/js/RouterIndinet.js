define('RouterIndinet', [
    'jquery',
    'underscore',
    'backbone',
    'IndinetView',
    'IndinetMenuView',
    'AttributeTypeListView',
    'AttributeTypeView',
    'AttributeTypeEditView',
    'AttributeTypeModel'
], function($, _, Backbone, IndinetView, IndinetMenuView, AttributeTypeListView,
        AttributeTypeView, AttributeTypeEditView, AttributeType) {
    var IndinetRouter;

    IndinetRouter = Backbone.Router.extend({
        routes: {
            'indinet': 'indinet',
            'indinet/attributeTypes': 'showAttributeTypes', 
            'indinet/attributeTypes/new': 'addAttributeType',
            'indinet/attributeTypes/:id': 'showAttributeType',
            'indinet/attributeTypes/:id/edit': 'editAttributeType'
        },
        initialize: function() {
            this.attributeTypeView = {};
            this.attributeTypeEditView = {};
            this.indinetMenuView = new IndinetMenuView();

            // cached elements
            this.elms = {
                'tab-content': $('.tab-content'),
                'page-content': $('.page-content'),
                'news-content': $('.news-content')
            };
            this.elms['tab-content'].html(this.indinetMenuView.render().el);
            $('footer').fadeIn('slow');

            // oculta inicialmente el menu de indinet
            this.indinetMenuView.$el.hide();
        },
        indinet: function() {
            console.log('js/RouterIndinet.js indinet 2');
            
            // muestra el menú de indinet
            this.indinetMenuView.$el.show();

            if (!this.indinetView) {
                this.indinetView = new IndinetView();
            }
            this.elms['page-content'].html(this.indinetView.render().el);
        },
        showAttributeTypes: function() {
            var that = this;

            if (!this.attributeTypeListView) {
                this.attributeTypeListView = new AttributeTypeListView();
            }
            this.attributeTypeListView.render(function() {
                that.elms['page-content'].html(that.attributeTypeListView.el);
            });
        },
        showAttributeType: function(id) {
            var that = this, view;

            console.log('js/ReuterIndinet.js showAttributeType 1');

            // pass _silent to bypass validation to be able to fetch the model
            model = new AttributeType({_id: id, _silent: true});
            model.fetch({
                success: function(model) {
                    model.unset('_silent');

                    view = new AttributeTypeView({model: model});
                    that.elms['page-content'].html(view.render().el);
                    view.model.on('delete-success', function() {
                        delete view;
                        that.navigate('/indinet/attributeTypes', {trigger: true});
                    });
                },
                error: function(model, res) {
                    if (res.status === 404) {
                        // TODO: handle 404 Not Found
                    } else if (res.status === 500) {
                        // TODO: handle 500 Internal Server Error
                    }
                }
            });
        },
        addAttributeType: function() {
            var that = this, model, view;

            model = new AttributeType();
            view = new AttributeTypeEditView({model: model});

            this.elms['page-content'].html(view.render().el);
            view.on('back', function() {
                delete view;
                that.navigate('#/indinet/attributeTypes', {trigger: true});
            });
            view.model.on('save-success', function(id) {
                delete view;
                that.navigate('#/indinet/attributeTypes/' + id, {trigger: true});
            });
        },
        editAttributeType: function(id) {
            var that = this, model, view;

            // pass _silent to bypass validation to be able to fetch the model
            model = new AttributeType({_id: id, _silent: true});
            model.fetch({
                success: function(model) {
                    model.unset('_silent');

                    // Create & render view only after model has been fetched
                    view = new AttributeTypeEditView({model: model});
                    that.elms['page-content'].html(view.render().el);
                    view.on('back', function() {
                        delete view;
                        that.navigate('#/indinet/attributeTypes/' + id, {trigger: true});
                    });
                    view.model.on('save-success', function() {
                        delete view;
                        that.navigate('#/indinet/attributeTypes/' + id, {trigger: true});
                    });
                },
                error: function(model, res) {
                    if (res.status === 404) {
                        // TODO: handle 404 Not Found
                    } else if (res.status === 500) {
                        // TODO: handle 500 Internal Server Error
                    }
                }
            });

        }
    });

    return IndinetRouter;
});
