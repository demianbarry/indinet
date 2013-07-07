define('RouterHome', [
    'jquery',
    'underscore',
    'backbone',
    'HomeView',
    'NewsView',
    'HeaderView'
], function($, _, Backbone, HomeView, NewsView, HeaderView) {
    var AppRouter;

    AppRouter = Backbone.Router.extend({
        routes: {
            '': 'home',
            'home': 'home',
            'news': 'news',
            // any other action defaults to the following handler
            '*actions': 'defaultAction'
        },
        initialize: function() {
            this.headerView = new HeaderView();
            // cached elements
            this.elms = {
                'tab-content': $('.tab-content'),
                'page-content': $('.page-content'),
                'news-content': $('.news-content')
            };
            $('header').hide().html(this.headerView.render().el).fadeIn('slow');
            $('footer').fadeIn('slow');
        },
        home: function() {
            this.headerView.select('home-menu');

            if (!this.homeView) {
                this.homeView = new HomeView();
            }
            this.elms['page-content'].html(this.homeView.render().el);

            if (!this.newsView) {
                this.newsView = new NewsView();
            }
            this.elms['news-content'].html(this.newsView.render().el);
        },
        news: function() {

            if (!this.newsView) {
                this.newsView = new NewsView();
            }
            this.elms['news-content'].html(this.newsView.render().el);
        },
        defaultAction: function(actions) {
            // No matching route, log the route?
            console.log('url no reconocida...');
        }
    });

    return AppRouter;
});
