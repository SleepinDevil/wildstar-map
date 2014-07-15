var Crypto = require('crypto');

function Database(pool) {
    this.pool = pool
};

Database.prototype = {
    getPlaces : function(map, callback) {
        this.pool.query(
            "SELECT" +
                "p.x AS x," +
                "p.y AS y," +
                "p.name AS name," +
                "p.description AS description," +
                "c.name AS category," +
                "c.icon AS icon" +
            "FROM places p" +
            "LEFT JOIN categories c ON p.category = c.id" +
            "WHERE map = ?",
            [map],
            function(err, rows) {
                conn.release();
                callback(rows);
            }
        );
    },
    isCategoryValid : function(id, callback) {
        this.pool.query("SELECT id FROM categories WHERE id = ?", [id], function(err, result) {
            conn.release();
            if(err) {
                console.log(err);
                callback(err, false);
            }
            else {
                if(result.affectedRows == 0) callback(undefined, false);
                else callback(undefined, true);
            }
        });
    },
    addPlace : function(x, y, name, description, category, cookie, callback) {
        this.isCategoryValid(category, function(err, catOK) {
            if(catOK) {
                this.pool.query("INSERT INTO places(name, description, x, y, category, cookie) VALUES (?, ?, ?, ?, ?, ?)",
                    [name, description, x, y, category, cookie],
                    function(err, result) {
                        if(err) {
                            console.error();
                            callback(err);
                        }
                        callback(undefined, result.insertId);
                    }
                );
            }
            else {
                callback("This is not a valid category.");
            }
        });
    },
    getCategories : function(callback) {
        this.pool.query("SELECT name, description, icon FROM categories", function(err, rows) {
            if(err) {
                console.error(err);
                callback(err);
            }
            else {
                callback(undefined, rows);
            }
        });
    },
    addUser : function(ip, callback) {
        this.pool.getConnection(function(err, conn) {
            conn.query("SELECT id FROM cookies ORDER BY id DESC LIMIT 1, 1", function(err, rows) {
                if(err) {
                    console.error(err);
                    callback(err);
                }
                else {
                    var id;
                    if(rows.length == 0) id = 0;
                    else id = rows[0].id + 1;
                    var string = ip + Date.now() + id;
                    var hash = Crypto.createHash("sha1").update(string).digest("hex");
                    conn.query("INSERT INTO cookies(cookie) VALUES(?)", [hash], function(err, result) {
                        conn.release();
                        if(err) {
                            console.error(err);
                            callback(err);
                        }
                        else {
                            callback(undefined, hash, result.insertId);
                        }
                    });
                }
            });
        });
    },
    getUserID : function(cookie, callback) {
        this.pool.getConnection(function(err, conn) {
            conn.query("SELECT id FROM cookies WHERE cookie = ?", [cookie], function(err, rows) {
                conn.release();
                if(!err && rows.length == 1) callback(undefined, rows[0].id);
                else {
                    if(err) {
                        console.error(err);
                        callback(err);
                    }
                    else {
                        if(rows.length > 1) console.error("There is more then one user with the same key. Fuck!");
                        callback("This is not a valid userid.");
                    }
                }
            });
        });
    }
};

module.exports = Database;