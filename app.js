var http = require("http");
var ws = require("./ws/");
var fs = require("fs");
var sys = require("sys");
var url = require('url');
var path = require('path');
http.createServer(function (request, response) {
	var filePath = '.' + request.url;
	if (filePath == './')
		filePath = './index.html';
		
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}
	
	fs.exists(filePath, function(exists) {
	
		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});
		}
		else {
			response.writeHead(404);
			response.end();
		}
	});
	
}).listen(8080);
console.log('Server running at http://127.0.0.1:8080/');


var server = ws.createServer(function (connection) {
	connection.nickname = null;
	connection.on("text", function (str) {
		if (connection.nickname === null) {
			connection.nickname = str;
			broadcast(connection.nickname,'в сети',true);
			rl.prompt();
		} else
			broadcast(connection.nickname,str);
			rl.prompt();
	})
	connection.on("close", function () {
		broadcast(connection.nickname,'не в сети',true);
		rl.prompt();
	})
})
server.listen(8081);


function broadcast(whoami,str) {
	server.connections.forEach(function (connection) {
		connection.sendText(str);
	})
}

var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('Sock> ');
rl.prompt();
rl.on('line', function(liner) {
	line = liner.split(" ")
    if(line[0] === "/letmego"){
    	rl.close();
    }
    if(line[0] === "/users"){
    	console.log('Users online:');
		server.connections.forEach(function (connection) {
			console.log(connection.nickname);
		})
    }
    if(line[0] === "/notify"){
    	if(line.length<4){
	    	console.log('This command need 4 attr.');	
    	}
    	else{
    		if(server.connections.length === 0){
	    		console.log('No users online!');
    		}
    		else{
    		check = 0;
				server.connections.forEach(function (connection) {
					if(connection.nickname === line[1]){
						console.log('Sended Notify to '+line[1]);
						liner = liner.replace(line[0]+' ', '');
						liner = liner.replace(line[1]+' ', '');
						liner = liner.replace(line[2]+' ', '');
						var str = "{text: '"+liner+"',layout: 'bottomRight',type: '"+line[2]+"'}";
						var json = JSON.stringify(eval("(" + str + ")"));
						connection.sendText(json);
						check = 1;
					}
					else{
					
					}
					
				});
				if(check != 1){
					console.log(line[1]+' is offline!');
				}
    		}

		}
    }
    rl.prompt();
}).on('close',function(){
    process.exit(0);
});
