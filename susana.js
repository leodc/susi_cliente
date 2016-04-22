/**
 * Module Dependencies
 * */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var fs = require('fs');
var mongodb = require("./mongoDB.js");


/**
 * View engine
 * */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public'))); //Make resources public


/**
 * Routers controllers
 * */
var indexRouter = require("./routes/router.js");
app.use("/", indexRouter);


/**
 * Service Configuration
 * */
app.set('port', process.env.PORT || 16502);


io.on('connection', function(socket){
    
    findAndEmit({},socket); // Primera pagina
    
    socket.on("newPage", function(filters){
        findAndEmit(filters,socket);
    });
    
});


/**
 * Start
 * */
http.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


function findAndEmit(filters, socket){
    mongodb.find(filters,function(err,docs){
        if(err){
            console.log("Error obteniendo los documentos", err);
        }
        
        socket.emit("newData", docs);
    });
}