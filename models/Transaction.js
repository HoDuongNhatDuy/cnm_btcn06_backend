var mongoose = require('mongoose');

var TransactionSchema = new mongoose.Schema(
    {
        description: {type: String, required: true},
        source_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        source_wallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Wallet'
        },
        dest_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        dest_wallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Wallet'
        },
        amount: {type: Number, required: true},
        created_at: {type: String}
    }
);

//Export model
module.exports = mongoose.model('Transaction', TransactionSchema, 'transactions');
