/**
 * Created by Asfandyar on 12/3/16.
 */

// Set up requirements
var express = require("express");
var logger = require('morgan');
var Request = require('request');
var bodyParser = require('body-parser');
var _ = require('underscore');
var cards = require("node-of-cards");
var favicon = require('serve-favicon');

// Create an 'express' object
var app = express();
app.use(favicon(__dirname + '/public/img/favicon-96x96.png'));
// Some Middleware - log requests to the terminal console
app.use(logger('dev'));
// Set up the views directory
app.set("views", __dirname + '/views');
// Set EJS as templating language WITH html as an extension
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
// Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));
// Enable json body parsing of application/json
app.use(bodyParser.json());

var port = process.env.PORT || 3000;
// Start the server & save it to a var
var server = app.listen(port);
//Pass the server var as an arg to the 'io' init requirement
var io = require('socket.io')(server);
console.log('Express started on port ' + port);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/*---------------
 //DATABASE CONFIG
 ----------------*/
var cloudant_USER = 'asirhindi';
var cloudant_DB = 'blackjack_mashups';
var cloudant_KEY = 'indeseervintempercessera';
var cloudant_PASSWORD = 'bfa410176fbcd532995d69325d2d30af8ec902f0';

var cloudant_URL = "https://" + cloudant_USER + ".cloudant.com/" + cloudant_DB;

/*-----
 ROUTES
 -----*/

// Main Page Route
app.get("/", function (req, res) {
    res.render('index');
});

// JSON Serving Routes
app.get("/api/get_deck/:count", function (req, res) {
    var count = req.params.count;
    var options = {"number_of_decks": count};
    cards.shuffle(options, function (err, data) {
        res.json(data);
    });
});

app.get("/api/shuffle/:deck_id", function (req, res) {
    var deck_id = req.params.deck_id;
    var options = {"deck_id": deck_id};
    cards.reshuffle(options, function (err, data) {
        res.json(data);
    });
});

app.get("/api/draw_cards/:deck_id/:count", function (req, res) {
    var deck_id = req.params.deck_id;
    var count = req.params.count;
    var requestURL = "http://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=" + count;
    Request(requestURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            var theData = JSON.parse(body);
            //console.log(theData);
            //send all the data
            res.json(theData);
        }
    });
});

//SAVE an object to the db
app.post("/api/save", function (req, res) {
    //Get the data from the body
    var data = req.body;
    console.log(data);
    //Send the data to the db
    Request.post({
            url: cloudant_URL,
            auth: {
                user: cloudant_KEY,
                pass: cloudant_PASSWORD
            },
            json: true,
            body: data
        },
        function (error, response, body) {
            if (response.statusCode == 201) {
                console.log("Saved!");
                res.json(body);
            }
            else {
                console.log("Uh oh...");
                console.log("Error: " + res.statusCode);
                console.log(res.body);
                res.send("Something went wrong...");
            }
        });
});

//JSON Serving route - ALL Data
app.get("/api/all", function (req, res) {
    console.log('Making a db request for all entries');
    //Use the Request lib to GET the data in the CouchDB on Cloudant
    Request.get({
            url: cloudant_URL + "/_all_docs?include_docs=true",
            auth: {
                user: cloudant_KEY,
                pass: cloudant_PASSWORD
            },
            json: true
        },
        function (error, response, body) {
            var theRows = body.rows;
            theRows.sort(function (a, b) {
                if (a.doc.date > b.doc.date) {
                    return 1;
                }
                if (a.doc.date < b.doc.date) {
                    return -1;
                }
                if (a.doc.date == b.doc.date) {
                    return 0;
                }
            });
            //Send the data
            res.json(theRows);
        });
});

//Main Socket Connection
// io.on('connection', function (socket) {
//     //console.log('a user connected');
//     socket.on('drawing', function (data) {
//         socket.broadcast.emit('news', data);
//         //console.log(data);
//     });
// });
