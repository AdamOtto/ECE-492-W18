// This is an echo test to check that the webpage to arduino connection via serialport is possible. (alternative PHP method is scrapped, cannot properly read on window OS)

// Modified from: https://www.youtube.com/watch?v=rhagmAv35Kk
var serialport = require('serialport');
var http = require('http');
var portName = process.argv[2];
var data_buf = '';
var string = 'aaa123456789012345678901234567890\n'; //34 bytes (keep under 64 bytes)
var myPort = new serialport(portName, {
    baudRate: 9600,
    parser: new serialport.parsers.Readline('\n\r'),
    buffersize: 128
});

myPort.on('open', onOpen);
myPort.on('data', onData);

function onOpen(){
    console.log('Open connections!');
}
var i = 0;
var k = 0;
flag_data = 0;
flag_web = 0;
function onData(data){
    console.log('on Data ' + data)
    data_buf += data;
}

http.createServer(function (req, res) { // Double invocation issue, must be solved
	res.writeHead(200, {'Content-Type': 'text/html'});
	for(i = 0; i < string.length; i++) {
		myPort.write(new Buffer(string[i], 'ascii'));
    }
	console.log('Write check ' + data_buf);
	res.write("The " + k.toString() + "'th string is " + data_buf);
	res.end();
}).listen(8080);
