// Auxiliary declarations
var message = ""; // hase to be global
var portName = process.argv[2];
var hostPort = process.argv[3];
var fs = require('fs');
var serialport = require('serialport');
var express = require("express");
var bodyParser = require('body-parser');
var mysql = require("mysql");
var http = require('http');
var socket_io = require('socket.io');
var xhr = require('xmlhttprequest');

var phonenums
var p_index = 0;

xhttp = new xhr.XMLHttpRequest();
xhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		console.log(this.responseText);
	}
};
var req ="?StationName=" + "'Station8'" + "&" +
		"Latitude=" + "50" + "&" +
		"Longitude=" + "-50" + "&" +
		"Temperature=" + "36.2" + "&" +
		"Dust10=" + "13.4" + "&" + 	
		"Dust2_5=" + "2.57" + "&" +
		"Humidity=" + "74.3" + "&" +
		"Battery=" + "77" + "&" +
		"Date=" + "NOW()";
xhttp.open("GET", "http://localhost/insert.php" + req, true);
xhttp.send();

// Note that operations execute in async

// MySQL module
//////////////////////////////
// mySQL setup
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'ece492database'
});

// establish connection
connection.connect(on_connect);
	
function on_connect(err) {
	if(err){
		console.log(err.code);
		console.log(err.fatal);
		console.log("My SQL was not connected.")
	} 
	else {
		console.log("My SQL connection is established.");
	}
}

function on_disconnect(err) { // not used
	console.log("My SQL is disconnected.");
}

// for insertion query to the sql connection
function insert_query(sql_conn, query_text) {
	return sql_conn.query(query_text, function(err, result) {
		if (err) {
			console.log("Error in data entry.");
		}
		else {
			console.log("Query is performed.");
		}
	});
}

// Serialport Module
///////////////////////////////
// Serial communication setup
var commPort = new serialport(portName, {
    baudRate: 115200,
    parser: new serialport.parsers.Readline("\n"), // files might still be chunked, need to verify
    buffersize: 128
});

commPort.on("open", onOpen);
commPort.on("data", onData);
function onOpen (err) {
	if (err) {
		return -1;
	}
	 else { 
		console.log('Connection with Arduino established');
		return 0;
	}
}

// responds to all data read from the serialport
function onData(data){
	message += data;
	if (data[data.length - 1] == 10 || data[data.length - 1] == 13) { // check for "!" (end of message, not sure if it is corrupted though)
		console.log('Complete input: ' + message);
		console.log(phonenums);
		messages = message.split(new RegExp("[\n]"));
		for (var i = 0; i < messages.length; i++) {
			if (messages[i] != "") {
				if (messages[i][0] == '?' && messages[i][messages[i].length - 1] == '!') {
					fields = messages[i].substr(1, messages[i].length - 2).split(",");
					//~ console.log(fields);
					if (fields.length == 9) { // With data generated from arduino
						query_text = "insert into `remotestation` () values (";
						for (var j = 0; j < fields.length; j++) {
							if (j != 0) {
								query_text += ",";
							}
							if (j === "NAN") {
								query_text += "NULL"
							}
							else {
								query_text += fields[j];
							}
						}
						query_text += ")";
						//~ console.log(query_text);
						insert_query(connection, query_text);
					}
					
					else if (fields.length == 8) { // Date to be generate in sql (preferred)
						query_text = "insert into `remotestation` () values (";
						for (var j = 0; j < fields.length; j++) {
							query_text += fields[j];
							query_text += ",";
						}
						query_text += "";
						//~ var date = new Date();
						//~ query_text += date.toISOString().replace(/T/, ' ').replace(/\..+/, ''); // https://stackoverflow.com/questions/10645994/node-js-how-to-format-a-date-string-in-utc
						query_text += "NOW()"
						query_text += ")";
						console.log(query_text);
						insert_query(connection, query_text);
					}
				}
			}
		}
		message = '';
	}
}

function onClose (err) { // Not used
	if (err) {
		return -1;
	}
	 else { 
		console.log('Connection with Arduino closed');
		return 0;
	}
}

// The express and http used to create the web page on localhost at specified port
////////////////////////////////
var app = express();

app.use(express.static('ECE492GUI')); // default path

app.get('/', function(req, res){ // get the web page
	res.sendFile(__dirname + '/index.html'); // change this to index2.html for testing for socket io
});

// establish a nodejs server
///////////////////////////////////////
var server = http.Server(app);
server.listen(parseInt(hostPort, 10), function(){
	console.log('listening on port: ' + hostPort);
});

// Socket module 
///////////////////////////////////////
var io = socket_io(server)
io.on('connection', ioConnection);

function ioConnection(socket){
	console.log('a user connected');
	socket.on('freqChange', function(msg){ // On frequency change for poll time
		// query sql for stuff
		query_text = "select PhoneNumber from `stationdata`";
		connection.query(query_text, function (err, result) {
			if (err) return err;
			phonenums = result;
			p_index = 0;
			for (i = 0; i < result.length; i++) {
				console.log(result[i].PhoneNumber);
				commPort.write(result[i].PhoneNumber + ",");
			}
			console.log(msg);
			commPort.write("T"+msg);
		});
	});
	socket.on('addStation', function(msg){ // Manual add station (node the best method)
		console.log('message: ' + msg);
		msgs = msg.split(",");
		query_text = "insert into `stationdata` () values (";
		for (i = 0; i < msgs.length; i++) {
			if (i != 0) {
				query_text += ",";
			}
			query_text += "\'" + msgs[i] + "\'";
		}
		query_text += ")";
		console.log(query_text);
		insert_query(connection, query_text);
	});
	socket.on('delStation', function(msg){
		console.log('message: ' + msg);
	});
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
}
