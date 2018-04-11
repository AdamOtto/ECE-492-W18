// Auxiliary declarations
var portName = process.argv[2];
var hostPort = process.argv[3];
var serialport = require('serialport');
var express = require("express");
var mysql = require("mysql");
var http = require('http');
var socket_io = require('socket.io');
var xhr = require('xmlhttprequest');

/// MySQL module
// setup connection to local MySql database
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'ece492database'
});
// establish connection
connection.connect(on_connect);
	
function on_connect(err) { // callback function when connected
	if(err){
		console.log("My SQL was not connected.")
	} 
	else {
		console.log("My SQL connection is established.");
	}
}

// insertion query (specific method is created to declutter code)
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

/// Serialport Module
// Serial communication setup for home station
var commPort = new serialport(portName, {
    baudRate: 115200,
    parser: new serialport.parsers.Readline("\n"), // files might still be chunked, need to verify
    buffersize: 128
});

// Establish connection
commPort.on("open", onOpen);

function onOpen (err) { // call back function to execute when commPort is open
	if (err) {
		console.log(err);
		console.log("COnnection with Arduino not established");
	}
	 else { 
		console.log('Connection with Arduino established');
		commPort.on("data", onData);//
		return 0;
	}
}

// Note that a proper message possesses the following structure:
// 			?_message_!\n
// where _message_ should be substituted by the actual message received
var message = ""; // global data collector
function onData(data){ // commPort callback function when data is recevied from serial port
	message += data; // collect data as they are received
	if (data[data.length - 1] == 10 || data[data.length - 1] == 13) { // check for termination char '\r' or '\n'
		console.log('Complete input: ' + message);
		messages = message.split(new RegExp("[\n\r]")); // messages are typically received as ?_message1_!\n?_message2_!\n..., thus, individual message must be parsed
		//~ console.log("Not" + messages)
		for (var i = 0; i < messages.length; i++) { // for each independent message
			if (messages[i] != "") { // ignore blank message
				if (messages[i][0] == '?' && messages[i][messages[i].length - 1] == '!') { // ensure independent messages are correct
					fields = messages[i].substr(1, messages[i].length - 2).split(",");
					//~ console.log("Thing:" + fields[i])
					if (fields.length == 9) { // 9-argument input receives date generated from the Arduino home station to time stamp the data entry
						(function (fields) { // invoke anonymous function to construct the insertion query
							st_name_query = "select StationName from `stationdata` where PhoneNumber = " + fields[0];
							// get StationName from stationdata table (if not exist, the remote station is unauthorized)
							connection.query(st_name_query, function (err, result) {
								if (err) {
									console.log("Error");
									return err;
								}
								if (result.length == 0) {
									console.log("Warning: Cannot find station in database");
									return 1;
								}
								fields[0] = "\"" + result[0].StationName + "\"";
								
								query_text = "insert into `remotestation` () values (";
								for (var j = 0; j < fields.length; j++) {
									if (fields[j] == "NAN") {
										query_text += "NULL";
									} 
									else {
										query_text += fields[j];
									}
									if ( j != fields.length - 1) {
										query_text += ",";
									}
								}
								query_text += ")";
								console.log("Insert Query: " + query_text);
								insert_query(connection, query_text); // perform insertion query
								
								// global_database
								xhttp = new xhr.XMLHttpRequest();
								xhttp.onreadystatechange = function() {
									if (this.readyState == 4 && this.status == 200) {
										console.log(this.responseText);
									}
								};
								var req ="?StationName=" + fields[0] + "&" +
										"Latitude=" + fields[1] + "&" +
										"Longitude=" + fields[2] + "&" +
										"Temperature=" + fields[3] + "&" +
										"Dust10=" + fields[4] + "&" + 	
										"Dust2_5=" + fields[5] + "&" +
										"Humidity=" + fields[6] + "&" +
										"Battery=" + fields[7] + "&" +
										"Date=" + fields[8];
								xhttp.open("GET", "http://ece492group4.000webhostapp.com/insertweb.php" + req, true);
								xhttp.send();
							});
						})(fields);
					}
					
					else if (fields.length == 8) { // Date to be generate in by MySQL database (local and web-host may not be consistent in time)
						// local_database
						(function (fields) {
							st_name_query = "select StationName from `stationdata` where PhoneNumber = " + fields[0];
							//~ console.log("Name qry: " + st_name_query);
							connection.query(st_name_query, function (err, result) {
								if (err) {
									console.log("Error");
									return err;
								}
								if (result.length == 0) {
									console.log("Warning: Cannot find station in database");
									return 1;
								}
								fields[0] = "\"" + result[0].StationName + "\"";
								
								query_text = "insert into `remotestation` () values (";
								for (var j = 0; j < fields.length; j++) {
									if (fields[j] == "NAN") {
										query_text += "NULL";
									} else {
										query_text += fields[j];
									}
									query_text += ",";
								}
								query_text += "NOW()"
								query_text += ")";
								console.log("Insert Query: " + query_text);
								insert_query(connection, query_text);
								
								// global_database
								xhttp = new xhr.XMLHttpRequest();
								xhttp.onreadystatechange = function() {
									if (this.readyState == 4 && this.status == 200) {
										console.log(this.responseText);
									}
								};
								var req ="?StationName=" + fields[0] + "&" +
										"Latitude=" + fields[1] + "&" +
										"Longitude=" + fields[2] + "&" +
										"Temperature=" + fields[3] + "&" +
										"Dust10=" + fields[4] + "&" + 	
										"Dust2_5=" + fields[5] + "&" +
										"Humidity=" + fields[6] + "&" +
										"Battery=" + fields[7] + "&" +
										"Date=NOW()";
								xhttp.open("GET", "http://ece492group4.000webhostapp.com/insertweb.php" + req, true);
								xhttp.send();
							});
						})(fields);
					}
				}
			}
		}
		message = '';
	}
}

// The express and http used to create the web page on localhost at specified port
var app = express();

app.use(express.static('ECE492GUI')); // default path

app.get('/', function(req, res){ // get the web page
	res.sendFile(__dirname + '/index.html'); // change this to index.html for testing for socket io
});

// establish a localhost server
var server = http.Server(app);
server.listen(parseInt(hostPort, 10), function(){
	console.log('listening on port: ' + hostPort);
});

/// Socket module (to communicate directly from the web page to nodejs program)
var io = socket_io(server)
io.on('connection', ioConnection);

function ioConnection(socket){
	console.log('a user connected');
	socket.on('freqChange', function(msg){ // On frequency change for poll time
		commPort.write("T," + msg);
		// Alternative method to send data to designated remote station (under construction)
		//~ query_text = "select PhoneNumber from `stationdata`";
		//~ connection.query(query_text, function (err, result) {
			//~ if (err) return err;
			//~ commPort.write("T," + msg);
		//~ });
	});
	socket.on('addStation', function(msg){ // Manual add station
		//~ console.log('message: ' + msg);
		// authorization: add station to permitted remote stations (data from here are inserted to the database)
		msgs = msg.split(",");
		query_text = "insert into `stationdata` () values (";
		for (i = 0; i < msgs.length; i++) {
			if (i != 0) {
				query_text += ",";
			}
			query_text += "\'" + msgs[i] + "\'";
		}
		query_text += ")";
		//~ console.log(query_text);
		insert_query(connection, query_text);
	});
	socket.on('delStation', function(msg){ // Manual delete station
		//~ console.log('message: ' + msg);
		// authorization: delete station from permitted remote stations (data from here is not entered into the database)
		msgs = msg.split(",");
		query_text = "delete from `stationdata` where StationName = \'" + msg + "\'";
		//~ console.log(query_text);
		insert_query(connection, query_text);
	});
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
}
