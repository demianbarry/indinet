module.exports = function(mongoose) {
  var crypto = require('crypto'),
   Schema    = mongoose.Schema,
      Account;

  var Rol = new mongoose.Schema ({
     rol:       { type: String }
  });
  
  Account = new Schema({
    username:   { type: String, unique: true },
    password:   { type: String },
    name: {
      first:    { type: String },
      last:     { type: String },
      full:     { type: String }
    },
    birthday: {
      day:      { type: Number, min: 1, max: 31, required: false },
      month:    { type: Number, min: 1, max: 12, required: false },
      year:     { type: Number }
    },
    email:      { type: String, unique: true },
    photoUrl:   { type: String },
    cvUrl:      { type: String },
    biography:  { type: String },
    roles:       [Rol],
    status:      { type: String }
  });

  var registerCallback = function(err) {
    if (err) {
      return console.log(err);
    };
    return console.log('Account was created');
  };

  Account.statics.changePassword = function changePassword(accountId, newpassword) {
    var shaSum = crypto.createHash('sha256');
    shaSum.update(newpassword);
    var hashedPassword = shaSum.digest('hex');
    Account.update({_id:accountId}, {$set: {password:hashedPassword}},{upsert:false},
      function changePasswordCallback(err) {
        console.log('Change password done for account ' + accountId);
    });
  };

  Account.statics.forgotPassword = function forgotPassword(email, resetPasswordUrl, callback) {
    var user = Account.findOne({email: email}, function findAccount(err, doc){
      if (err) {
        // Email address is not a valid user
        callback(false);
      } else {
        var smtpTransport = nodemailer.createTransport('SMTP', config.mail);
        resetPasswordUrl += '?account=' + doc._id;
        smtpTransport.sendMail({
          from: 'thisapp@example.com',
          to: doc.email,
          subject: 'IndiNet: requerimiento de claye',
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
    console.log('Login de : ',password);
    var shaSum = crypto.createHash('sha256');
    shaSum.update(password);
    var Model = mongoose.model('Account');
    Model.findOne({username:username,password:shaSum.digest('hex')},function(err,doc){
      callback(null!=doc);
    });
  };

  Account.statics.register = function register(username, password, firstName, lastName) {
    var shaSum = crypto.createHash('sha256');
    shaSum.update(password);

    console.log('Registrando ' + username);
    var user = new Account({
      username: username,
      name: {
        first: firstName,
        last: lastName
      },
      password: shaSum.digest('hex')
    });
    user.save(registerCallback);
    console.log('Save command was sent');
  };

  return mongoose.model('Account', Account);
};