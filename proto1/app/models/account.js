module.exports = function(mongoose) {
    var crypto = require('crypto'),
            Schema = mongoose.Schema,
            Account;

    var estados = 'generado activo baja bloqueado'.split(' ');

    Account = new Schema({
        username: {type: String, unique: true, required: true},
        password: {type: String, required: true},
        name: {
            first: {type: String, required: true},
            last: {type: String, required: true},
            full: {type: String, required: true}
        },
        birthday: {type: Date, required: false },
        email: {type: String, unique: true, required: true},
        photoUrl: {type: String},
        cvUrl: {type: String},
        biography: {type: String},
        roles: {type: String, required: true, default: 'usuario'},
        status: {type: String, enum: estados, required: true, default: 'generado'}
    });

    var registerCallback = function(err) {
        if (err) {
            return console.log(err);
        }
        ;
        return console.log('Account was created');
    };

    // similar to SQL's like
    function like(query, field, val) {
        return (field) ? query.regex(field, new RegExp(val, 'i')) : query;
    }

    Account.statics.search = function search(params, callback) {
        var Model = mongoose.model('Account'),
                query = Model.find();


        like(query, 'username', params.username);
        like(query, 'email', params.email);
        
        //console.log('query: %s', JSON.stringify(query));
        
        query.exec(callback);
    };

    Account.statics.findById = function findById(id, callback) {
        var Model = mongoose.model('Account'),
                query = Model.find();

        if (id.length !== 24) {
            callback(null, null);
        } else {
            Model.findOne().where('_id', id).exec(callback);
        }
    };

    Account.statics.changePassword = function changePassword(accountId, newpassword) {
        var shaSum = crypto.createHash('sha256');
        shaSum.update(newpassword);
        var hashedPassword = shaSum.digest('hex');
        Account.update({_id: accountId}, {$set: {password: hashedPassword}}, {upsert: false},
        function changePasswordCallback(err) {
            console.log('Change password done for account ' + accountId);
        });
    };

    Account.statics.forgotPassword = function forgotPassword(email, resetPasswordUrl, callback) {
        var user = Account.findOne({email: email}, function findAccount(err, doc) {
            if (err) {
                // Email address is not a valid user
                callback(false);
            } else {
                var smtpTransport = nodemailer.createTransport('SMTP', config.mail);
                resetPasswordUrl += '?account=' + doc._id;
                smtpTransport.sendMail({
                    from: 'thisapp@example.com',
                    to: doc.email,
                    subject: 'IndiNet: requerimiento de clave',
                    text: 'Click aquí para blanquear su clave: ' + resetPasswordUrl
                }, function forgotPasswordResult(err) {
                    if (err) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            }
        });
    };

    Account.statics.login = function login(username, password, callback) {
        //console.log('Login de : ', password);
        var shaSum = crypto.createHash('sha256');
        shaSum.update(password);
        var Model = mongoose.model('Account');
        Model.findOne({username: username, password: shaSum.digest('hex')}, function(err, doc) {
            callback(null != doc, doc);
        });
    };

    Account.statics.register = function register(username, password, firstname, lastname, email, callback) {
        var Account = mongoose.model('Account', Account);
        var shaSum = crypto.createHash('sha256');
        shaSum.update(password);
        
        //console.log('Registrando ' + username);
        var name={};
        name.first = firstname;
        name.last = lastname;
        name.full = lastname + ', ' + firstname;
        var user = new Account({
            username: username,
            name: name,
            password: shaSum.digest('hex'),
            email: email
        });
        console.log('user: %s', JSON.stringify(user));
        user.save(function(err) {
            callback(err);
        });
    };

    return mongoose.model('Account', Account);
};