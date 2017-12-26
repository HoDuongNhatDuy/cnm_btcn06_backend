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

function findUser(userId) {
    return new Promise(resolve => {
        User.findOne({_id: userId}, function (error, user_result) {
                console.log("123", user_result);
                if (!user_result) {
                    resolve(null);
                }
                else {
                    resolve(user_result);
                }
            })
    });
}

function getWalletsByUserId(userId) {
    return new Promise(resolve => {
        Wallet.find({user: userId}, function (error, wallets_result) {
                if (!wallets_result) {
                    resolve([]);
                }
                else {
                    resolve(wallets_result);
                }
            });
    });
}

function getTransactionByUserId(userId) {
    return new Promise(resolve => {
        Transaction.find({$or: [{source_user: userId}, {dest_user: userId}]}).limit(5).sort({created_at: -1}).populate(["source_wallet", "source_user", "dest_wallet"]).exec(function (error, transactions) {
                if (!transactions) {
                    resolve([]);
                }
                else {
                    resolve(transactions);
                }
            });
    });
}

exports.GetTotalInfo = async function (req, res, next) {
    try {
        let userId = req.params.id;
        user         = await findUser(userId);

        if (!user) {
            res.json({
                status: 0,
                message: 'User not found'
            });
        }

        // call these 2 function at the same time
        let wallets      = getWalletsByUserId(userId);
        let transactions = getTransactionByUserId(userId);

        // wait for them
        await wallets;
        await transactions;

        result = {
            transactions: transactions,
            wallets: wallets
        };
        res.json({
            status: 1,
            message: "Got total info successfully",
            data: result
        });
    }
    catch (e) {
        res.json({
            status: 0,
            message: e
        });
    }
};