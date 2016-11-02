module.exports = {
    startListeners: function(){
        require('./user').init();
        require('./group').init();
        require('./chat').init();
    }
};