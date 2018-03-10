// Auxiliary declarations
var message = '';
var fs = require('fs');
var serialport = require('serialport');
var express = require("express");
var fs = require('fs');
var flag = 0;

// Serial communication setup
var portName = process.argv[2];

var commPort = new serialport(portName, {
    baudRate: 115200,
    parser: new serialport.parsers.Readline(), // files might still be chunked, need to verify
    buffersize: 128
});

commPort.on('open', function () {
	console.log('Connection with Arduino set');
	fs.open('test.csv', 'a', function (err, fd) {
		if (err) {
			console.error(err);
		}
		console.log("File test.csv created successfully");
		fs.close(fd, function(err) {
			if (err) {
				console.log(err);
			}
			console.log("File test.csv closed successfully");
		});
	});
});

commPort.on('data', onData);

function onData(data){
	message += data;
	if (data[data.length - 1] == 10 || data[data.length - 1] == 13) {
		console.log('Total input: ' + message);
		// prepare some cases for corrupted message (lacks a ? start and ! end)
		fs.appendFile('test.csv', message.substring(1, message.length-1)+'\n', function(err) {
		   if (err) {
			  console.error(err);
		   }
		});
		message = '';
	}
}

// Application setup
var app = express();

app.use(express.static('ECE492GUI'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html'); // change this to index2.html for testing for socket io
});

// http setup
var http = require('http').Server(app);
http.listen(3000, function(){
	console.log('listening on *:3000');
});

// IO setup
var io = require('socket.io')(http);
io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
	});
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
  });
});

