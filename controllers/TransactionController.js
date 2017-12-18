let Wallet = require('../models/Wallet');
let Transaction = require('../models/Transaction');
let GlobalController = require('../controllers/GlobalController');

exports.Create = function (req, res, next) {
    let sourceWalletId = req.body.source_wallet;
    let destWalletId   = req.body.dest_wallet;
    let amount         = req.body.amount;
    let description    = req.body.description;

    GlobalController.CreateTransaction(sourceWalletId, destWalletId, amount, description, function (result) {
        res.json(result);
    });
};