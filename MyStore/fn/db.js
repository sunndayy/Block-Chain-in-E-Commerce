var mysql = require('mysql');

exports.load = sql => {
    return new Promise((resolve, reject) => {
        var cn = mysql.createConnection({
            host: "remotemysql.com",
            user: "fROIiKFSmc",
            password: "QdTXNSaDEB",
            database: "fROIiKFSmc",
            port: '3306'
        });

        cn.connect();

        cn.query(sql, function(error, rows, fields) {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }

            cn.end();
        });
    });
}

exports.save = sql => {
    return new Promise((resolve, reject) => {
        var cn = mysql.createConnection({
            host: "remotemysql.com",
            user: "fROIiKFSmc",
            password: "QdTXNSaDEB",
            database: "fROIiKFSmc",
            port: '3306'
        });

        cn.connect();

        cn.query(sql, function(error, value) {
            if (error) {
                reject(error);
            } else {
                resolve(value);
            }

            cn.end();
        });
    });
}
