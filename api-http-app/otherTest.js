const io = require('socket.io-client');
const apiServerURL = '127.0.0.1';

var createAccountSocket = io.connect('http://' + apiServerURL + '/createAccount');
createAccountSocket.on('submitTransactionError', function (error) {
    console.log(error);
})