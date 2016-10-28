var app = require('../app').app;

module.exports = {
    broadcast: function(topic, uids, message, callback){
        for (var i=0;i<uids.length;i++) {
            var clientSocket = app.get('clientSocket')[uids[i]];
            if (clientSocket) {
                clientSocket.emit(topic, message);
            }
        }
    }
};