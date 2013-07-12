define('AccountEditView', [
    'jquery',
    'underscore',
    'backbone',
    'bootstrap-multivalue',
    'moment',
    'text!templates/accounts/edit.html',
    'AccountModel'
], function($, _, Backbone, Multivalue, moment, tpl, Account) {
    var AccountEditView;

    AccountEditView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);

            this.errTmpl = '<div class="span4">';
            this.errTmpl += '<div class="alert alert-error">';
            this.errTmpl += '<button type="button" class="close" data-dismiss="alert">x</button>';
            this.errTmpl += '<%- msg %>';
            this.errTmpl += '</div>';
            this.errTmpl += '</div>';
            this.errTmpl = _.template(this.errTmpl);
        },
        events: {
            "focus .input-prepend input": "removeErrMsg",
            "click .save-btn": "saveAccount",
            "click .back-btn": "goBack"
        },
        render: function() {
            var tmpl;
            //, formattedDate = ' ', bornAttr;

            //bornAttr = this.model.get('born');
            //formattedDate = moment(new Date(bornAttr)).format("MM/DD/YYYY");

            //tmpl = this.template({ client: this.model.toJSON(), formattedDate: formattedDate });
            tmpl = this.template({account: this.model.toJSON()});

            $(this.el).html(tmpl);

            return this;
        },
        goBack: function(e) {
            //console.log('/js/views/accounts/edit.js goBack 2');
            e.preventDefault();
            this.trigger('back');
        },
        saveAccount: function(e) {
            //console.log('/js/views/accounts/edit.js saveAccount 1');
            var username, name = {}, email, cvUrl, biography, roles, that;

            e.preventDefault();

            that = this;
            username = $.trim($('#username-input').val());
            name.first = $.trim($('#first-name-input').val());
            name.last = $.trim($('#last-name-input').val());
            name.full = name.last + ', ' + name.first;
            email = $.trim($('#email-input').val());
            cvUrl = $.trim($('#cvUrl-input').val());
            biography = $.trim($('#biography-input').val());
            $('#roles-input').multivalue('restore');
            roles = $.trim($('#roles-input').val());
            //console.log('/js/views/accounts/edit.js saveAccount 1 valor de roles: %s',roles);

            this.model.save({
                username: username,
                name: name,
                email: email,
                cvUrl: cvUrl,
                biography: biography,
                roles: roles
            }, {
                silent: false,
                sync: true,
                success: function(model, res) {
                    if (res && _.keys(res.errors).length) {
                        //console.log('/js/views/accounts/edit.js saveAccount 4 %s', JSON.stringify(res));
                        that.renderErrMsg(res.errors);
                    } else {
                        model.trigger('save-success', model.get('_id'));
                    }
                },
                error: function(model, res) {
                    //console.log('/js/views/accounts/edit.js saveAccount 2 %s', JSON.stringify(res));
                    if (res && res.errors) {
                        that.renderErrMsg(res.errors);
                    } else if (res.status === 404) {
                        // TODO: handle 404 Not Found
                    } else if (res.status === 500) {
                        // TODO: handle 500 Internal Server Error
                    }
                }
            });
        },
        renderErrMsg: function(err) {
            //console.log('/js/views/accounts/edit.js saveAccount 3 %s', JSON.stringify(err));
            var msgs = [];

            this.removeErrMsg();

            if (_.isString(err)) {
                msgs.push(err);
            } else {
                if (err.general) {
                    msgs.push(err.general);
                    delete err.general;
                }
                if (_.keys(err).length) {
                    msgs.push(_.keys(err).join(', ') + ' field(s) are invalid');
                }
            }
            msgs = _.map(msgs, function(string) {
                // uppercase first letter
                return string.charAt(0).toUpperCase() + string.slice(1);
            }).join('.');
            $(this.el).find('form').after(this.errTmpl({msg: msgs}));
        },
        removeErrMsg: function() {
            $(this.el).find('.alert-error').remove();
        }
    });

    return AccountEditView;
});

