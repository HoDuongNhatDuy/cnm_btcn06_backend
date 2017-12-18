let Wallet           = require('../models/Wallet');
let Transaction      = require('../models/Transaction');
let GlobalController = require('../controllers/GlobalController');
let User             = require('../models/User');

exports.GetWallets = function (req, res, next) {
    let user_id = req.params.id;

    let result = {};
    Wallet.find().where({user: user_id}).exec()
        .then(function (wallets) {
            result = JSON.parse(JSON.stringify(wallets));


            res.json({
                status: 1,
                message: "Got wallets successfully",
                data: result
            });
        });
};

exports.GetTotalInfo = function (req, res, next) {
    let user_id = req.params.id;
    let user    = null;
    let wallets = null;

    User.findOne({_id: user_id}).exec()
        .then(function (user_result) {
            if (!user_result) {
                res.json({
                    status: 0,
                    message: "User not found",
                });
                return null;
            }

            user = user_result;
            return Wallet.find().where({user: user_id}).exec();
        })
        .then(function (wallets_result) {
            wallets = wallets_result;

            return Transaction.find().where({$or: [{source_user: user_id}, {dest_user: user_id}]}).limit(5).sort({created_at: -1}).populate(["source_wallet", "source_user", "dest_wallet"]).exec()
        })
        .then(function (transactions) {
            result = {
                transactions: transactions,
                wallets: wallets
            };
            res.json({
                status: 1,
                message: "Got total info successfully",
                data: result
            });
        });
};