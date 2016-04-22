/**
 * Module Dependencies
 * */
var mongodb = require('mongodb');


/**
 * MongoDB conf
 * */
var HOST = "107.170.232.222";
var PORT = 27017;
var DB = "susi_db";
var COLLECTION = "escenas";


/**
 * Page conf
 * */
var PAGE_LIMIT = 20;

var find = function(options, callback){
    var server = new mongodb.Server(HOST, PORT);
    var db = new mongodb.Db(DB, server);
    
    db.open(function (err, client) {
        if(err){
            console.log("Error en la conexión", err);
            callback(err, null);
        }
        
        db.collection(COLLECTION).find(options).sort( { scene_date: -1 }).limit(PAGE_LIMIT).toArray(callback);
    });
};


/**
 * 
 * DAO
 * 
 * */
module.exports = {
    find: find
};