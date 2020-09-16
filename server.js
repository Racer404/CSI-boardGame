var http = require('http');
var url = require('url');

var serverRunningSeconds=0;
var playerList=new Array();
http.createServer(function(req, res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
	var params = url.parse(req.url, true).query;
	var path= url.parse(req.url, true).pathname+"";

	if(path=='/checkConnection')
	{	
		if(playerList.length==0){
			console.log('FIRST PLAYER');
			playerList[0]=new Object({name:params.name+'',runningSeconds:serverRunningSeconds+''});
			console.log(playerList[0]);
		}
		else{
			var samePlayer=false;
			for(var i=0;i<playerList.length;i++){
				if(playerList[i].name==params.name){
					console.log('SAME PLAYER');
					samePlayer=true;
					playerList[i].runningSeconds=serverRunningSeconds;
					break;
				}
			}
			if(!samePlayer){
				console.log('NEW PLAYER');
				playerList[playerList.length]=new Object({name:params.name+'',runningSeconds:serverRunningSeconds+''});
				console.log(playerList[i]);
			}
		}
		res.write(playerList.length+'');
		res.end();
	}
	else{
		res.write('FalsePathName'+path);
		res.end();
		}
}).listen(3000);

setInterval(loop,1000);

function loop()
{
	serverRunningSeconds++;
	for(var i=0;i<playerList.length;i++)
	{
		if(serverRunningSeconds-playerList[i].runningSeconds>5){
			playerList.splice(i,1);
		}
	}
}

console.log("Server is running");
