let User = require('../models/User');
let GlobalController = require('../controllers/GlobalController');
let Wallet = require('../models/Wallet');
let Transaction = require('../models/Transaction');

exports.Login = function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;

    User.GetByUsername(username, function (err, user) {
        if (err || !user){
            res.json({
                status: 0,
                message: "User not found"
            });
            return;
        }

        User.ComparePassword(password, user.password, function(err, isMatch){
            if (err) {
                res.json({
                    status: 0,
                    message: "Can not compare password"
                });
                return;
            }

            if(isMatch){
                res.json({
                    status: 1,
                    message: "Logged in successfully",
                    data: {
                        user_id: user.id
                    }
                });
                return;
            } else {
                res.json({
                    status: 0,
                    message: "Password was not match"
                });
                return;
            }
        });
    });
};

exports.Register = function (req, res, next) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    var newUser = new User({
        username: username,
        email:email,
        password: password
    });

    User.CreateUser(newUser, function (err, user) {
        if (err){
            res.json({
                status: 0,
                message: "Fail to create user"
            });
            return;
        }

        let newWallet = new Wallet({
            "user": user.id,
            "name": "Default Wallet",
            "description": "Default Wallet"
        });
        newWallet.save(function (error, wallet) {
            GlobalController.GetAdminWallet(function (admin_wallet_data) {
                if (admin_wallet_data.status == 0){
                    res.json(admin_wallet_data);
                    return null;
                }

                GlobalController.CreateTransaction(admin_wallet_data.data.id, wallet.id, 1000, "Init wallet", function (create_transaction_result) {
                    if (create_transaction_result.status == 0){
                        res.json(create_transaction_result);
                        return null;
                    }

                    res.json({
                        status: 1,
                        message: "Created user successfully",
                        data: {
                            user_id: user.id
                        }
                    });
                })
            });
        });
    });
};

function createAdminUser(callback) {
    let newUser = new User({
        username: "admin",
        email: "admin@mailinator.com",
        password: "admin"
    });

    User.CreateUser(newUser, function (err, user) {
        let newWalletData = new Wallet({
            "user": user.id,
            "name": "Admin Wallet",
            "description": "Admin Wallet",
            "amount": 99999999999999
        });

        newWalletData.save()
            .then(function (newWallet) {
                if (!newWallet){
                    callback({
                        status: 0,
                        message: "Fail to create wallet"
                    });
                    return null;
                }

                let newTransaction = new Transaction({
                    description: "Init",
                    source_user: null,
                    source_wallet: null,
                    dest_user: user.id,
                    dest_wallet: newWallet.id,
                    amount: 99999999999999,
                    created_at: new Date().toISOString()
                });

                return newTransaction.save();
            })
            .then(function (newTransaction) {
                if (!newTransaction){
                    callback({
                        status: 0,
                        message: "Fail init transaction"
                    });
                    return null;
                }

                callback({
                    status: 1,
                    message: "Init admin successfully"
                });
                return null;
            })

    })
    
}

exports.InitAdminData = function(req, res, next){
    User.GetByUsername("admin", function (error, admin_user) {
        if (admin_user){
            Wallet.findOne({user: admin_user.id}).exec()
                .then(function (err, wallet) {
                    if (wallet) {
                        return Wallet.findByIdAndRemove(wallet.id).exec();
                    }
                })
                .then(function (error) {
                    return User.findByIdAndRemove(admin_user.id).exec();
                })
                .then(function (error) {
                    createAdminUser(function (result) {
                        res.json(result);
                    });
                });
            return;
        }
        createAdminUser(function (result) {
            res.json(result);
        });
    })

};