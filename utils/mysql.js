var mysql = require('mysql');
var chalk = require('chalk');
var pool;

module.exports = {
    init: function(){
        pool = mysql.createPool({
            connectionLimit : 10,
            host            : 'localhost',
            user            : 'root',
            password        : '',
            database        : 'app-chat'
        });

        console.log(chalk.green('MySQL Connection ready...'));
    },
    getPool: function(){
        return pool;
    }
};