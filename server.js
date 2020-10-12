var http = require('http');
var url = require('url');
var fs = require('fs');

var serverRunningSeconds=0;
var playerList=new Array();



http.createServer(function(req, res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
	params = url.parse(req.url, true).query;
	path= url.parse(req.url, true).pathname+"";

	if(path=='/checkConnection')
	{	
		if(gameLock>10){
			res.write('STARTED');
			res.end();
		}
		else{
			adjustPlayers(params);
			res.write(playerList.length+'');
			res.end();
		}
	}
	
	else if(path=='/getCards')
	{
		res.write(JSON.stringify(playerList)+'');
		res.end();
	}

	else if(path=='/getGameState')
	{
		res.write(JSON.stringify(gameState)+'');
		res.end();
	}

	else if(path=='/getProgress')
	{
		res.write(gameState.progress+'');
		res.end();
	}

	else if(path='/murder')
	{
		if(gameState.crucial.length==0){
			gameState.crucial[gameState.crucial.length]=params.clueormethod;
			res.write(gameState.crucial.length+'');
			res.end();
			console.log('MURDER WITH'+params.clueormethod);
		}
		else if(gameState.crucial.length==1){
			gameState.crucial[gameState.crucial.length]=params.clueormethod;
			res.write('end');
			res.end();
			console.log('MURDER WITH'+params.clueormethod);
			gameState.progress='testify';
		}
	}
	else{
		res.write('FalsePathName'+path);
		res.end();
		}
}).listen(3000);










var waitingSeconds=5;
var gameLock=0;
var loopKey=setInterval(loop,1000);

function loop()
{
	serverRunningSeconds++;
	for(var i=0;i<playerList.length;i++)
	{
		if(serverRunningSeconds-playerList[i].runningSeconds>waitingSeconds){
			console.log(playerList[i].name+' has dropped out');
			playerList.splice(i,1);
		}
	}

	if(playerList.length>=4){
		gameLock++;
		if(gameLock>10){
			initCards();
			initGame();
			console.log('gameStart!');
			clearInterval(loopKey);
			console.log(playerList);
			console.log(gameState);
		}
	}
	else{
	gameLock=0;
	}
}




function adjustPlayers(params)
{	
	if(playerList.length==0){
		console.log(params.name+' has log in!');		
		playerList[0]=new Object({name:params.name+'',runningSeconds:serverRunningSeconds+''});
	}
		
	else{
		var samePlayer=false;
		for(var i=0;i<playerList.length;i++){
			if(playerList[i].name==params.name){	
				samePlayer=true;
				playerList[i].runningSeconds=serverRunningSeconds;
				break;
			}
		}
		if(!samePlayer){
			console.log(params.name+' has log in!');
			playerList[playerList.length]=new Object({name:params.name+'',runningSeconds:serverRunningSeconds+''});	
		}
	}

}






var cardsPath ='./CSI.json';
var cards = JSON.parse(fs.readFileSync(cardsPath,'utf-8').toString());

function initCards()
{	for(var p=0;p<playerList.length;p++){
		playerList[p].method = new Array();
		for(var i=0;i<4;i++){
			var cacheRandom=Math.floor(Math.random()*cards.method.length);
			playerList[p].method[i]=cards.method[cacheRandom];
			cards.method.splice(cacheRandom,1);
		}
		playerList[p].clue = new Array();
		for(var i=0;i<4;i++){
			var cacheRandom=Math.floor(Math.random()*cards.clue.length);
			playerList[p].clue[i]=cards.clue[cacheRandom];
			cards.clue.splice(cacheRandom,1);
		}
	}
	
	var idArray;
	switch(playerList.length){
		case 4:
			idArray=new Array('目击者','凶手','侦探','侦探');
			break;
		case 5:
			idArray=new Array('目击者','凶手','帮凶','侦探','侦探');
			break;
		case 6:
			idArray=new Array('目击者','凶手','帮凶','侦探','侦探','第二目击者');
			break;
		case 7:
			idArray=new Array('目击者','凶手','帮凶','侦探','侦探','侦探','第二目击者');
			break;
		case 8:
			idArray=new Array('目击者','凶手','帮凶','侦探','侦探','侦探','侦探','第二目击者');
			break;
	}
	for(var i=0;i<playerList.length;i++){
		var cacheRandom=Math.floor(Math.random()*idArray.length);		
		playerList[i].id=idArray[cacheRandom];
		idArray.splice(cacheRandom,1);
	}
}







var gameState=new Object();
function initGame()
{
	gameState.progress='murder';
	gameState.crucial=new Array();
	gameState.info=new Array();
	gameState.info[0]=cards.location[Math.floor(Math.random()*6)];
	for(var i=1;i<6;i++){
		var cacheRandom=Math.floor(Math.random()*cards.info.length-1)+1;
		gameState.info[i]=cards.info[cacheRandom];
		cards.info.splice(cacheRandom,1);
	}
	gameState.info[6]=cards.info[0];
	gameState.remainPoints=new Array();
	for(var i=0;i<playerList.length;i++){
		gameState.remainPoints[i]=playerList[i].name;
	}
	return gameState;
}

console.log("Server is running");
