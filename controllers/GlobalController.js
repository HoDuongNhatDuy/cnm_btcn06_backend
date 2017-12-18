let Wallet = require('../models/Wallet');
let Transaction = require('../models/Transaction');
let GlobalController = require('../controllers/GlobalController');
let User = require('../models/User');

exports.GetTotalTransaction = function (wallet_id, transactions) {
    let total = 0;
    transactions.forEach(function (transaction, index) {
        if (transaction.source_wallet == wallet_id)
            total -= transaction.amount;
        else if (transaction.dest_wallet == wallet_id)
            total += transaction.amount;
    });

    return total;
};

exports.CreateTransaction = function (sourceWalletId, destWalletId, amount, description, callback) {
    let sourceWallet = null;
    let destWallet   = null;

    Wallet.findById(sourceWalletId).exec()
        .then(function (srcWallet) {
            if (!srcWallet) {
                callback({
                    status: 0,
                    message: wallet.errors
                });
                return null;
            }
            sourceWallet = srcWallet;

            return Transaction.find().where({$or: [{source_wallet: sourceWalletId}, {dest_wallet: sourceWalletId}]}).exec();
        })
        .then(function (transactions) {
            let total = GlobalController.GetTotalTransaction(sourceWalletId, transactions);
            if (total < amount) {
                callback({
                    status: 0,
                    message: "Insufficient balance"
                });
                return null;
            }

            return Wallet.findById(destWalletId).exec();
        })
        .then(function (desWallet) {
            if (!desWallet) {
                callback({
                    status: 0,
                    message: error
                });
                return null;
            }
            destWallet = desWallet;

            let sourceAmount = sourceWallet.amount - amount;
            return sourceWallet.update({amount: sourceAmount}).exec();
        })
        .then(function (result) {
            if (result && result.ok != 1) {
                callback({
                    status: 0,
                    message: "Can't update wallet"
                });
                return null;
            }
            let destAmount = parseFloat(destWallet.amount) + parseFloat(amount);
            return destWallet.update({amount: destAmount});
        })
        .then(function (result) {
            if (result && result.ok != 1) {
                callback({
                    status: 0,
                    message: "Can't update wallet"
                });
                return null;
            }
            let sourceUserId = sourceWallet.user.toString();
            let destUserId   = destWallet.user.toString();

            let newTransaction = new Transaction({
                description: description,
                source_user: sourceUserId,
                source_wallet: sourceWalletId,
                dest_user: destUserId,
                dest_wallet: destWalletId,
                amount: amount,
                created_at: new Date().toISOString()
            });

            newTransaction.save(function (err, transaction) {
                if (err) {
                    callback({
                        status: 0,
                        message: err.message
                    });
                    return null;
                }

                callback({
                    status: 1,
                    message: "Created transaction successfully",
                    data: {
                        transaction_id: transaction.id
                    }
                });
                return null;
            });
        })
        .catch(function (error) {
            console.log(error);
            callback({
                status: 0,
                message: "Unknown error"
            });
            return null;
        });
};

exports.GetAdminWallet = function (callback) {
    User.GetByUsername("admin", function (error, user) {
        if (error){
            callback({
                status: 0,
                message: "System wallet not found"
            });
            return null;
        }

        Wallet.findOne({user: user.id}, function (error, wallet) {
            callback({
                status: 1,
                media: "Get wallet successfully",
                data: wallet
            })
        })
    })
};