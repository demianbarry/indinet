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

            // manejo de mensaje de error
            this.errTmpl = '<div class="span4">';
            this.errTmpl += '<div class="alert alert-error">';
            this.errTmpl += '<button type="button" class="close" data-dismiss="alert">x</button>';
            this.errTmpl += '<%- msg %>';
            this.errTmpl += '</div>';
            this.errTmpl += '</div>';
            this.errTmpl = _.template(this.errTmpl);

            // manejo de mensaje de succes
            this.successTmpl = '<div class="span4">';
            this.successTmpl += '<div class="alert alert-success">';
            this.successTmpl += '<button type="button" class="close" data-dismiss="alert">x</button>';
            this.successTmpl += '<%- msg %>';
            this.successTmpl += '</div>';
            this.successTmpl += '</div>';
            this.successTmpl = _.template(this.successTmpl);

            doCheckAuth(this.render);
        },
        events: {
            "click #loginButton": "login",
            "click #logoutButton": "logout",
            "click #registerButton": "register"
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
            //console.log('js/views/header.js login 1');
            doLogin(this.render);
            return false;
        },
        logout: function() {
            doLogout(this.render);
            return false;
        },
        register: function() {
            doRegister(this);
            return false;
        },
        renderSuccessMsg: function(msg) {
            $(this.el).find('form').after(this.successTmpl({msg: msg}));
        },
        removeSuccessMsg: function() {
            $(this.el).find('.alert-success').remove();
        },
        renderErrMsg: function(err) {
            $(this.el).find('form').after(this.errTmpl({msg: err}));
        },
        removeErrMsg: function() {
            $(this.el).find('.alert-error').remove();
        }
    });

    return HeaderView;
});

function doLogin(post_ajax_render) {
    //console.log('js/views/header.js doLogin 1');
    var data;
    $.post('/account/login', {
        username: $('input[name=username]').val(),
        password: $('input[name=password]').val()
    }, function(data) {
        //console.log('Bienvenido: ', JSON.parse(data).username);
        post_ajax_render(JSON.parse(data).username);
    }).error(function() {
        $("#error").text('Imposible entrar.');
        $("#error").slideDown();
    });
    //return false;
}

function doLogout(post_ajax_render) {
    var data;
    $.get('/account/logout', function(data) {
        //console.log('js/views/header.js doLogout logout exitoso antes del render');
        post_ajax_render('null');
        //console.log('js/views/header.js doLogout logout exitoso antes del navigate');
        app.navigate('home', true);
    }).error(function() {
        $("#error").text('Imposible salir.');
        $("#error").slideDown();
    });
}

function doCheckAuth(post_ajax_render) {
    var data;
    $.get('/account/authenticated', {}, function(data) {
        //console.log('Bienvenido: ', data);
        post_ajax_render(data);
    }).error(function() {
        $("#error").text('Imposible chequear.');
        $("#error").slideDown();
        post_ajax_render('null');
    });
    //return false;
}

function doRegister(post_ajax_render) {
    //console.log('js/views/header.js doregister 1 %s', $('input[name=r-username]').val());
    var data;

    // chequea igualdad de password
    if (!($('input[name=r-password]').val() === $('input[name=r-re-password]').val())) {
        post_ajax_render.renderErrMsg('Password no son iguales. Re-intente.');
        return;
    }

    $.post('/account/register', {
        username: $('input[name=r-username]').val(),
        password: $('input[name=r-password]').val(),
        firstName: $('input[name=r-name-first]').val(),
        lastName: $('input[name=r-name-last]').val(),
        email: $('input[name=r-email]').val()
    }, function(data) {
        //console.log('regsitrado: ', JSON.parse(data).username);
        post_ajax_render.renderSuccessMsg('usuario registrado exitosamente');
        //post_ajax_render.render();
    }).error(function() {
        post_ajax_render.renderErrMsg('Imposible registrar al usuario.');
    });
    //return false;
}

