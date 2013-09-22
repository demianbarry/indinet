define('RouterIndinet', [
    'jquery',
    'underscore',
    'backbone',
    'IndinetView',
    'IndinetMenuView',
    'AttributeTypeListView',
    'AttributeTypeContainerView',
    'AttributeTypeView',
    'AttributeTypeEditView',
    'AttributeTypeModel',
    'AccountListView',
    'AccountView',
    'AccountEditView',
    'AccountModel',
    'NodeContainerView',
    'NodeView',
    'NodeEditView',
    'NodeModel',
    'RelationshipContainerView',
    'RelationshipView',
    'RelationshipEditView',
    'RelationshipModel'  
], function($, _, Backbone, IndinetView, IndinetMenuView, 
        AttributeTypeListView, AttributeTypeContainerView, AttributeTypeView, AttributeTypeEditView, AttributeType,
        AccountListView, AccountView, AccountEditView, Account,
        NodeContainerView, NodeView, NodeEditView, Node,
        RelationshipContainerView, RelationshipView, RelationshipEditView, Relationship) {
    var IndinetRouter;

    IndinetRouter = Backbone.Router.extend({
        routes: {
            'indinet': 'indinet',
            'indinet/attributeTypes': 'showAttributeTypes',
            'indinet/attributeTypes/new': 'addAttributeType',
            'indinet/attributeTypes/:id': 'showAttributeType',
            'indinet/attributeTypes/:id/edit': 'editAttributeType',
            'indinet/accounts': 'showAccounts',
            'indinet/accounts/new': 'addAccount',
            'indinet/accounts/:id': 'showAccount',
            'indinet/accounts/:id/edit': 'editAccount',
            'indinet/nodes': 'showNodes',
            'indinet/nodes/new': 'addNode',
            'indinet/nodes/:id': 'showNode',
            'indinet/nodes/:id/edit': 'editNode',
            'indinet/relationships': 'showRelationships',
            'indinet/relationships/new': 'addRelationship',
            'indinet/relationships/:id': 'showRelationship',
            'indinet/relationships/:id/edit': 'editRelationship'
        },
        initialize: function() {
            this.accountSession = {};
            this.indinetMenuView = new IndinetMenuView();
            //this.attributeTypeListView = new AttributeTypeListView();

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
            //console.log('js/RouterIndinet.js indinet 2');

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();

            if (!this.indinetView) {
                this.indinetView = new IndinetView();
            }
            this.elms['page-content'].html(this.indinetView.render().el);
        },
        showAttributeTypes: function() {

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('attributes-menu');

            if (!this.attributeTypeContainerView) {
                this.attributeTypeContainerView = new AttributeTypeContainerView();
            }
            this.elms['page-content'].html(this.attributeTypeContainerView.render("").el);
            /*
            this.attributeTypeListView.render(function() {
                that.elms['page-content'].html(that.attributeTypeListView.el);
            });
            */
        },
        showAttributeType: function(id) {
            var model, that = this, view;

            //console.log('js/ReuterIndinet.js showAttributeType 1');

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('attributes-menu');

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

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('attributes-menu');

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

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('attributes-menu');

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

        },
        showAccounts: function() {
            var that = this;

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('usuarios-menu');

            if (!this.accountListView) {
                this.accountListView = new AccountListView();
            }
            this.accountListView.render(function() {
                that.elms['page-content'].html(that.accountListView.el);
            });
        },
        showAccount: function(id) {
            var that = this, view;

            //console.log('js/ReuterIndinet.js showAttributeType 1');

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('usuarios-menu');

            // pass _silent to bypass validation to be able to fetch the model
            model = new Account({_id: id, _silent: true});
            model.fetch({
                success: function(model) {
                    model.unset('_silent');
                    
                    //console.log('js/RouterIndinet.js showAccount Account model recuperado: %s',JSON.stringify(model));
                    view = new AccountView({model: model});
                    that.elms['page-content'].html(view.render().el);
                    view.model.on('delete-success', function() {
                        delete view;
                        that.navigate('/indinet/accounts', {trigger: true});
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
        addAccount: function() {
            var that = this, model, view;

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('usuarios-menu');

            model = new Account();
            console.log('js/RouteIndinet.js addAccount model %s',JSON.stringify(model));
            view = new AccountEditView({model: model});

            this.elms['page-content'].html(view.render().el);
            view.on('back', function() {
                delete view;
                that.navigate('#/indinet/accounts', {trigger: true});
            });
            view.model.on('save-success', function(id) {
                delete view;
                that.navigate('#/indinet/accounts/' + id, {trigger: true});
            });
        },
        editAccount: function(id) {
            var that = this, model, view;

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('usuarios-menu');

            // pass _silent to bypass validation to be able to fetch the model
            model = new Account({_id: id, _silent: true});
            model.fetch({
                success: function(model) {
                    model.unset('_silent');

                    // Create & render view only after model has been fetched
                    view = new AccountEditView({model: model});
                    that.elms['page-content'].html(view.render().el);
                    view.on('back', function() {
                        delete view;
                        that.navigate('#/indinet/accounts/' + id, {trigger: true});
                    });
                    view.model.on('save-success', function() {
                        delete view;
                        that.navigate('#/indinet/accounts/' + id, {trigger: true});
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
        showNodes: function() {

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('nodes-menu');

            if (!this.nodeContainerView) {
                this.nodeContainerView = new NodeContainerView();
            }
            this.elms['page-content'].html(this.nodeContainerView.render("").el);
            /*
            this.attributeTypeListView.render(function() {
                that.elms['page-content'].html(that.attributeTypeListView.el);
            });
            */
        },
        showNode: function(id) {
            var that = this, view;

            //console.log('js/ReuterIndinet.js showNode 1');

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('nodes-menu');

            // pass _silent to bypass validation to be able to fetch the model
            model = new Node({_id: id, _silent: true});
            model.fetch({
                success: function(model) {
                    model.unset('_silent');

                    view = new NodeView({model: model});
                    that.elms['page-content'].html(view.render().el);
                    view.model.on('delete-success', function() {
                        delete view;
                        that.navigate('/indinet/nodes', {trigger: true});
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
        addNode: function() {
            var that = this, model, view;

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('nodes-menu');

            model = new Node();
            view = new NodeEditView({model: model});

            this.elms['page-content'].html(view.render().el);
            view.on('back', function() {
                delete view;
                that.navigate('#/indinet/nodes', {trigger: true});
            });
            view.model.on('save-success', function(id) {
                delete view;
                that.navigate('#/indinet/nodes/' + id, {trigger: true});
            });
        },
        editNode: function(id) {
            var that = this, model, view;

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('nodes-menu');

            // pass _silent to bypass validation to be able to fetch the model
            model = new Node({_id: id, _silent: true});
            model.fetch({
                success: function(model) {
                    model.unset('_silent');

                    // Create & render view only after model has been fetched
                    view = new NodeEditView({model: model});
                    that.elms['page-content'].html(view.render().el);
                    view.on('back', function() {
                        delete view;
                        that.navigate('#/indinet/nodes/' + id, {trigger: true});
                    });
                    view.model.on('save-success', function() {
                        delete view;
                        that.navigate('#/indinet/nodes/' + id, {trigger: true});
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
        showRelationships: function() {

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('relationships-menu');

            if (!this.relationshipContainerView) {
                this.relationshipContainerView = new RelationshipContainerView();
            }
            this.elms['page-content'].html(this.relationshipContainerView.render("").el);
            /*
            this.attributeTypeListView.render(function() {
                that.elms['page-content'].html(that.attributeTypeListView.el);
            });
            */
        },
        showRelationship: function(id) {
            var that = this, view;

            //console.log('js/ReuterIndinet.js showNode 1');

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('relationships-menu');

            // pass _silent to bypass validation to be able to fetch the model
            model = new Relationship({_id: id, _silent: true});
            model.fetch({
                success: function(model) {
                    model.unset('_silent');

                    view = new RelationshipView({model: model});
                    that.elms['page-content'].html(view.render().el);
                    view.model.on('delete-success', function() {
                        delete view;
                        that.navigate('/indinet/relationships', {trigger: true});
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
        addRelationship: function() {
            var that = this, model, view;

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('relationships-menu');

            model = new Relationship();
            view = new RelationshipEditView({model: model});

            this.elms['page-content'].html(view.render().el);
            view.on('back', function() {
                delete view;
                that.navigate('#/indinet/relationships', {trigger: true});
            });
            view.model.on('save-success', function(id) {
                delete view;
                that.navigate('#/indinet/relationships/' + id, {trigger: true});
            });
        },
        editRelationship: function(id) {
            var that = this, model, view;

            // muestra/oculta componentes el menú de indinet
            $('.news-content').hide();
            $('.tab-content').show();
            this.indinetMenuView.$el.show();
            this.indinetMenuView.select('relationships-menu');

            // pass _silent to bypass validation to be able to fetch the model
            model = new Relationship({_id: id, _silent: true});
            model.fetch({
                success: function(model) {
                    model.unset('_silent');

                    // Create & render view only after model has been fetched
                    view = new RelationshipEditView({model: model});
                    that.elms['page-content'].html(view.render().el);
                    view.on('back', function() {
                        delete view;
                        that.navigate('#/indinet/relationships/' + id, {trigger: true});
                    });
                    view.model.on('save-success', function() {
                        delete view;
                        that.navigate('#/indinet/relationships/' + id, {trigger: true});
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
