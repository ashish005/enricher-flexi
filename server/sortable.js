/**
 * Created by wizdev on 1/15/2016.
 */
var express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    http = require('http'),
    fs = require('fs');
    async = require('async');

var  server = express(); // Set up an express server (but not starting it yet)
// configure app to use bodyParser()
// this will let us get the data from a POST
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(cors());

var port = process.env.PORT || 3002;        // set our port
server.set('port', port);

/*
 var options = {
 product: fs.readFileSync('./data-source/products.txt'),
 listing: fs.readFileSync('./data-source/listings.txt')
 };
*/

/*fs.readFile('./data-source/products.txt', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    console.log(data);
});*/

var fileNames = {
    products:{name:'products' , path : '../data-source/products.txt'},
    listings:{name:'listings' , path:'../data-source/listings.txt'},
    result:{name:'result' , path:'../data-source/result.txt'}
};

var sortableUtil = require('./business-logic.model')(fileNames, fs, async);//Define All routes here

server.get('/sortable', function (req, res) {
    sortableUtil(function(data){
        console.log('Command completed successfully');
    });
});
server.use('/', express.static(__dirname + '/'));
/*
server.listen(server.get('port'), function () {
    console.log('INFO: server is running on port ' + server.get('port'));
});*/
