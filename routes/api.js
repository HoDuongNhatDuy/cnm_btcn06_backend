let express               = require('express');
let AuthController        = require('../controllers/AuthController');
let WalletController      = require('../controllers/WalletController');
let UserController        = require('../controllers/UserController');
let TransactionController = require('../controllers/TransactionController');
let router                = express.Router();

router.post('/register', AuthController.Register);
router.post('/login', AuthController.Login);
router.get('/init-admin-data', AuthController.InitAdminData);

router.get('/wallet/:id', WalletController.Get);
router.get('/wallet/:id/transaction', WalletController.GetTransactions); // pending
router.post('/wallet', WalletController.Create);
router.put('/wallet/:id', WalletController.Update); // pending
router.delete('/wallet/:id', WalletController.Delete); // pending

router.get('/user/:id/wallet', UserController.GetWallets);
router.get('/user/:id/total-info', UserController.GetTotalInfo);

router.post('/transaction', TransactionController.Create);

module.exports = router;
