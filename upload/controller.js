// Auxiliary declarations
var message = "";
var portName = process.argv[2];
var hostPort = process.argv[3];
var fs = require('fs');
var serialport = require('serialport');
var express = require("express");
var bodyParser = require('body-parser');
var mysql = require("mysql");
var http = require('http');
var socket_io = require('socket.io');
var flag = 0;

// module setup
// mySQL setup
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'ece492database'
});


// Serial communication setup
var commPort = new serialport(portName, {
    baudRate: 115200,
    parser: new serialport.parsers.Readline("\n"), // files might still be chunked, need to verify
    buffersize: 128
});

// Application setup
var app = express();

app.use(bodyParser.urlencoded({
	extended: true
}));

app.post("/", function (req, res) {
	console.log(req.body.pollPeriod);
	commPort.write(req.body.pollPeriod);
	commPort.write("\n");
})

// Function
if (require.main === module) {
	
	commPort.on("open", onOpen);
	connection.connect(on_connect);	
	commPort.on("data", onData);
}


//////////////////////////////

function on_connect(err) {
	if(err){
		console.log(err.code);
		console.log(err.fatal);
		console.log("My SQL was not connected.")
	}
	console.log("My SQL connection is established.");
}

function on_disconnect(err) {
	console.log("My SQL is disconnected.");
}

///////////////////////////////

function onOpen (err) {
	if (err) {
		return -1;
	}
	 else { 
		console.log('Connection with Arduino established');
		return 0;
	}
}


function onClose (err) {
	if (err) {
		return -1;
	}
	 else { 
		console.log('Connection with Arduino closed');
		return 0;
	}
}

///////////////////////////////
function sqlquery(sql_conn, query_text) {
	sql_conn.query(query_text, function(err, result) {
		console.log("Result: " + result);
		if (err) {
			console.log("Error in data entry.");
		}
		else {
			console.log("Data entry inserted.");
		}
	});
}

///////////////////////////////

function onData(data){
	message += data;
	if (data[data.length - 1] == 10 || data[data.length - 1] == 13) { // check for "!" (end of message, not sure if it is corrupted though)
		console.log('Complete input: ' + message);
		messages = message.split(new RegExp("[\n]"));
		for (var i = 0; i < messages.length; i++) {
			if (messages[i] != "") {
				if (messages[i][0] == '?' && messages[i][messages[i].length - 1] == '!') {
					fields = messages[i].substr(1, messages[i].length - 2).split(",");
					console.log(fields);
					
					if (fields.length == 9) { // Do not hard code this, check for var length in sql table
						query_text = "insert into `remotestation` () values (";
						for (var j = 0; j < fields.length; j++) {
							if (j != 0) {
								query_text += ",";
							}
							query_text += fields[j];
						}
						query_text += ")";
						console.log(query_text);
						sqlquery(connection, query_text);
					}
	
					else if (fields.length == 8) { // Do not hard code this, check for var length in sql table
						query_text = "insert into `remotestation` () values (";
						for (var j = 0; j < fields.length; j++) {
							query_text += fields[j];
							query_text += ",";
						}
						query_text += "'";
						var date = new Date();
						query_text += date.toISOString().replace(/T/, ' ').replace(/\..+/, ''); // https://stackoverflow.com/questions/10645994/node-js-how-to-format-a-date-string-in-utc
						query_text += "')";
						console.log(query_text);
						sqlquery(connection, query_text);
					}
				}
			}
		}
		message = '';
	}
}


////////////////////////////////
app.use(express.static('ECE492GUI'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html'); // change this to index2.html for testing for socket io
});


///////////////////////////////////////
var server = http.Server(app);
server.listen(parseInt(hostPort, 10), function(){
	console.log('listening on port: ' + hostPort);
});

///////////////////////////////////////
var io = socket_io(server)
io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
	});
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
  });
});

