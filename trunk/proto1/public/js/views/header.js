define('HeaderView', [
    'jquery',
    'underscore',
    'backbone',
    'text!templates/header.html'
], function($, _, Backbone, tpl) {
    var HeaderView;
    //var username = 'null';

    HeaderView = Backbone.View.extend({
        initialize: function(options) {
            var ajaxLoader;
            this.template = _.template(tpl);
            _.bindAll(this, "render");

            $('body').ajaxStart(function() {
                ajaxLoader = ajaxLoader || $('.ajax-loader');
                ajaxLoader.show();
            }).ajaxStop(function() {
                if (ajaxLoader && typeof ajaxLoader.fadeOut == "function")
                    ajaxLoader.fadeOut('fast');
            });
            doCheckAuth(this.render);
        },
        events: {
            "click #loginButton": "login",
            "click #logoutButton": "logout"
        },
        render: function(username) {
            $(this.el).html(this.template({username: username}));
            return this;
        },
        select: function(item) {
            $('.nav li').removeClass('active');
            $('.' + item).addClass('active');
        },
        login: function() {
            console.log('js/views/header.js login 1');
            doLogin(this.render);
            return false;
        },
        logout: function() {
            doLogout(this.render);
            return false;
        }
    });

    return HeaderView;
});

function doLogin(post_ajax_render) {
    console.log('js/views/header.js doLogin 1');
    var data;
    $.post('/login', {
        username: $('input[name=username]').val(),
        password: $('input[name=password]').val()
    }, function(data) {
        console.log('Bienvenido: ', JSON.parse(data).username);
        post_ajax_render(JSON.parse(data).username);
    }).error(function() {
        $("#error").text('Imposible entrar.');
        $("#error").slideDown();
    });
    //return false;
}

function doLogout(post_ajax_render) {
    var data;
    $.get('/logout', function(data) {
        console.log('logout exitoso');        
        post_ajax_render('null');
    }).error(function() {
        $("#error").text('Imposible salir.');
        $("#error").slideDown();
    });
}

function doCheckAuth(post_ajax_render) {
    var data;
    $.get('/account/authenticated', {}, function(data) {
        console.log('Bienvenido: ', data);
        post_ajax_render(data);
    }).error(function() {
        $("#error").text('Imposible chequear.');
        $("#error").slideDown();
        post_ajax_render('null');
    });
    //return false;
}
