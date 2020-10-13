var socket = io();
// Load text with Ajax synchronously: takes path to file and optional MIME type
function loadTextFileAjaxSync(filePath, mimeType)
{
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET",filePath,false);
  if (mimeType != null) {
    if (xmlhttp.overrideMimeType) {
      xmlhttp.overrideMimeType(mimeType);
    }
  }
  xmlhttp.send();
  if (xmlhttp.status==200)
  {
    return xmlhttp.responseText;
  }
  else {
  console.log("exec");
    return null;
  }
}

function loadJSON(filePath) {
  // Load json file;
  var json = loadTextFileAjaxSync(filePath, "application/json");
  // Parse json
  return JSON.parse(json);
}


var keysdown = {
  up: false,
  down: false,
  left: false,
  right: false,
  switch: false,
  pup: false,
  pdown: false,
  pleft: false,
  pright: false,
  pswitch: false
}
var mee = {
    x  : 0.0,
    y  : 0.0,
    xv : 0.0,
    yv : 0.0,
	hp : 100.0,
	dir : false,
	pjs : [],//x,y,xv,yv,atk,dur,size
	score : 0,
	name : "person",
	anim : 0,
	char : 0
}

function intersectRect(r1, r2) {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}

var jump = {left:false,right:false,up:false,dash:false};


function collide(pl,r){
    if (intersectRect({top:pl.y-0.5,bottom:pl.y+0.5,right:pl.x+0.5,left:pl.x-0.5},r)){
		var roff=Math.abs(pl.x-0.5-r.right);
		var loff=Math.abs(pl.x+0.5-r.left);
		if (Math.abs(r.top-0.5-pl.y) < 0.6 && (loff>0.01||jump.up) && (roff>0.01||jump.up)){
            pl.y = r.top-0.499;
            if (pl.yv>0.0)
				pl.yv = 0.0;
			jump.up=true;
         }else{
            if (pl.x-((r.left+r.right)/2.0) < 0){
                if (Math.abs(r.left-0.5-pl.x) < 0.6){
                    pl.x = r.left-0.499;
                    if (pl.xv>0.0)
                        pl.xv = 0.0;
					jump.left=true;
                }else{
                    pl.y = r.bottom+0.5;
					if (pl.yv<0.0)
						pl.yv = 0.0;
                }
            }else{
                if (Math.abs(r.right+0.5-pl.x) < 0.6){
                    pl.x = r.right+0.499;
                    if (pl.xv<0.0)
                        pl.xv = 0.0;
					jump.right=true;
                }else{
                    pl.y = r.bottom+0.5;
                    if (pl.yv<0.0)
						pl.yv = 0.0;
                }
            }
         }
    }
}
//function collidepl(pl,pl2){
//    collide(pl,{top:pl2.y-0.5,bottom:pl2.y+0.5,right:pl2.x+0.5,left:pl2.x-0.5})
//}

var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
var ongoingTouches = [];
var canvas = document.getElementById('canvas');




if (isMobile){
	function handleStart(e) {ongoingTouches = e.touches;}
	function handleEnd(e)   {ongoingTouches = e.touches;}
	function handleCancel(e){ongoingTouches = e.touches;}
	function handleMove(e)  {ongoingTouches = e.touches;}
	canvas.addEventListener("touchstart", handleStart, false);
	canvas.addEventListener("touchend", handleEnd, false);
	canvas.addEventListener("touchcancel", handleCancel, false);
	canvas.addEventListener("touchmove", handleMove, false);
}
else{
	document.addEventListener('keydown', function(event) {
	switch (event.keyCode) {
    case 37: // <-

		if (!event.repeat)
		keysdown.left = true;
		break;
    case 90: // Z
      if (!event.repeat)
		keysdown.up = true;
      break;
	case 32: // Z
      if (!event.repeat)
		keysdown.up = true;
      break;
	case 38:
            if (!event.repeat)
			keysdown.up = true;
            break;
    case 39: // ->

		if (!event.repeat)
		keysdown.right = true;
      break;
    case 88: // X
      if (!event.repeat)
		keysdown.use = true;
      break;
	case 67:
		if (!event.repeat)
		keysdown.switch = true;
		break;
	}
	});
	document.addEventListener('keyup', function(event) {
	  switch (event.keyCode) {
      case 37:
            if (!event.repeat)
			keysdown.left = false;
            break;
      case 90:
            if (!event.repeat)
			keysdown.up = false;
            break;
	case 32:
            if (!event.repeat)
			keysdown.up = false;
            break;
		case 38:
            if (!event.repeat)
			keysdown.up = false;
            break;
      case 39:
            if (!event.repeat)
			keysdown.right = false;
            break;
      case 88:
            if (!event.repeat)
			keysdown.use = false;
            break;
	  case 67:
			if (!event.repeat)
			keysdown.switch = false;
			break;
	  }
	});
}

socket.emit('n');


socket.on('score', function(id) {
	if (id == socket.id)
		mee.score+=1;
}
)
socket.on('kick', function(id) {
	if (id == mee.name){
		window.close();
	}
}
)



setInterval(function() {
    socket.emit('u', mee);
	for (var i = 0; i < mee.pjs.length; i++) {
		if (mee.pjs[i].dur<=0.0){
			mee.pjs.splice(i,1);
		}
	}
}, 1000 / 30);


var rawlvl = loadJSON("static/level.json");

var lvl = rawlvl["map"]["objectgroup"][1]["object"];
var lvld = rawlvl["map"]["objectgroup"][0]["object"];
var lvlt = rawlvl["map"]["objectgroup"][2]["object"];
var ground = [];
var decor = [];
var tfuncs = [
		function(pl){console.log("trig")}

]
for (var i = 1; i < 23 ; i++){
	tfuncs.push(new Function("pl", "itemtypes["+i+"].stk=1;"));
}
var invincibility = 0;
tfuncs.push(function(pl){if (itemtypes[23].stk < 32)itemtypes[23].stk++;});
tfuncs.push(function(pl){if (itemtypes[24].stk < 32)itemtypes[24].stk++;});
tfuncs.push(function(pl){if (itemtypes[25].stk < 32)itemtypes[25].stk++;});
tfuncs.push(function(pl){itemtypes[26].stk=1;});
tfuncs.push(function(pl){pl.hp=-1;});
tfuncs.push(function(pl){pl.hp = 1;});
tfuncs.push(function(pl){pl.hp -= 10;});
tfuncs.push(function(pl){pl.hp -= 50;});
tfuncs.push(function(pl){pl.hp = pl.hp / 2;if (pl.hp < 1) pl.hp = -1;});
tfuncs.push(function(pl){pl.hp = pl.hp / 4;if (pl.hp < 1) pl.hp = -1;});
tfuncs.push(function(pl){pl.hp -= 1;});
tfuncs.push(function(pl){invincibility = 60;cool=60;});
tfuncs.push(function(pl){pl.x = 0; pl.y = 32;pl.xv = 0; pl.yv = 0;});
tfuncs.push(function(pl){pl.x = -658; pl.y = 488;pl.xv = 0; pl.yv = 0;});

var triggers = [];

if (lvl)
for (var i = 0; i < lvl.length; i++){
    var t = lvl[i];
	if (t["_width"]){
		var mul = 0.01;
		ground.push({col:t["_name"],left:parseInt(t["_x"])*mul,top:parseInt(t["_y"])*mul,right:parseInt(t["_x"])*mul+(parseInt(t["_width"])*mul+0.02),bottom:parseInt(t["_y"])*mul+(parseInt(t["_height"])*mul+0.02) } ) ;
		//if ('_value' in t["properties"]["property"])
		//	ground[ground.length-1].col = convertHexToRgbA(t["properties"]["property"]["_value"]);
	//console.log(t);
	}
}
if (lvld)
for (var i = 0; i < lvld.length; i++){
    var t = lvld[i];
	if (t["_width"]){
		var mul = 0.01;
		decor.push({col:t["_name"],left:parseInt(t["_x"])*mul,top:parseInt(t["_y"])*mul,right:parseInt(t["_x"])*mul+(parseInt(t["_width"])*mul+0.02),bottom:parseInt(t["_y"])*mul+(parseInt(t["_height"])*mul+0.02) } ) ;
		//if ('_value' in t["properties"]["property"])
		//	decor[decor.length-1].col = convertHexToRgbA(t["properties"]["property"]["_value"]);
	//console.log(t);
	}
}
if (lvlt)
for (var i = 0; i < lvlt.length; i++){
    var t = lvlt[i];
	if (t["_width"]){
		var mul = 0.01;
		triggers.push({cool:0.0,left:parseInt(t["_x"])*mul,top:parseInt(t["_y"])*mul,right:parseInt(t["_x"])*mul+(parseInt(t["_width"])*mul+0.02),bottom:parseInt(t["_y"])*mul+(parseInt(t["_height"])*mul+0.02),func:parseInt(t["_type"]),name:t["_name"] } ) ;
	//console.log(t);
	}
}



canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');

var cplayers;
socket.on('s', function(players) {
    cplayers = players;
	for (var id in cplayers) {
        if (id != socket.id){
			var player = cplayers[id] || {};
			for (var i = 0; i < player.pjs.length; i++) {
				if (intersectRect({top:mee.y-0.5,bottom:mee.y+0.5,right:mee.x+0.5,left:mee.x-0.5},
					{top:player.pjs[i].y-player.pjs[i].height,bottom:player.pjs[i].y+player.pjs[i].height,right:player.pjs[i].x+player.pjs[i].width,left:player.pjs[i].x-player.pjs[i].width})){
					if (hit <= 0.0){
						mee.hp-=player.pjs[i].atk;
						hit = 0.3;
						if (mee.hp <= 0.0){
							socket.emit('d',id);
						}
					}
				}
			}
		}
	}
});

var sitm = 0;
var itemtypes = [
	{
		stk:1,
		name:"your fist",
		cool:0.25,
		func:function(pl){
		var atk = 1;
		if (pl.dir)
			pl.pjs.push({x:pl.x+0.75,y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:0.25,height:0.25});
		else
			pl.pjs.push({x:pl.x-0.75,y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:0.25,height:0.25});
		}
	}//fist
	,{
		stk:0,
		name:"the better fist",
		cool:0.25,
		func:function(pl){
		var atk = 15;
		if (pl.dir)
			pl.pjs.push({x:pl.x+0.75,y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:0.25,height:0.25});
		else
			pl.pjs.push({x:pl.x-0.75,y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:0.25,height:0.25});
		}
	}//better fist
	,
	{
		stk:0,
		name:"pew pew",
		cool:0.5,
		func:function(pl){
		var atk = 1;
		if (pl.dir)
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:20,yv:0,dur:3,atk:atk,width:0.3,height:0.3});
		else
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-20,yv:0,dur:3,atk:atk,width:0.3,height:0.3});
		}
	}//pew pew
	,{
		stk:0,
		name:"good pew pew",
		cool:0.5,
		func:function(pl){
		var atk = 5;
		if (pl.dir)
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:20,yv:0,dur:3,atk:atk,width:0.3,height:0.3});
		else
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-20,yv:0,dur:3,atk:atk,width:0.3,height:0.3});
		}
	}//good pew pew
	,{
		stk:0,
		name:"great pew pew",
		cool:0.5,
		func:function(pl){
		var atk = 10;
		if (pl.dir)
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:20,yv:0,dur:3,atk:atk,width:0.3,height:0.3});
		else
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-20,yv:0,dur:3,atk:atk,width:0.3,height:0.3});
		}
	}//great pew pew
	,{
		stk:0,
		name:"master pew pew",
		cool:0.5,
		func:function(pl){
		var atk = 20;
		if (pl.dir)
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:20,yv:0,dur:3,atk:atk,width:0.3,height:0.3});
		else
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-20,yv:0,dur:3,atk:atk,width:0.3,height:0.3});
		}
	}//best pew pew
	,
	{
		stk:0,
		name:"sword",
		cool:0.75,
		func:function(pl){
		var atk = 10;

		if (pl.dir)
			pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:1.0,height:0.23});
		else
			pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:1.0,height:0.23});
		if (pl.hp > 95){
			if (pl.dir)
				pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:15,yv:0,dur:1.7,atk:atk/5,width:1.0,height:0.23});
			else
				pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:-15,yv:0,dur:1.7,atk:atk/5,width:1.0,height:0.23});
		}
		}
	}//sword
	,{
		stk:0,
		name:"great sword",
		cool:0.75,
		func:function(pl){
		var atk = 20;

		if (pl.dir)
			pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:1.0,height:0.23});
		else
			pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:1.0,height:0.23});
		if (pl.hp > 95){
			if (pl.dir)
				pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:15,yv:0,dur:1.7,atk:atk/5,width:1.0,height:0.23});
			else
				pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:-15,yv:0,dur:1.7,atk:atk/5,width:1.0,height:0.23});
		}
		}
	}//good sword
	,{
		stk:0,
		name:"master sword",
		cool:0.75,
		func:function(pl){
		var atk = 30;

		if (pl.dir)
			pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:1.0,height:0.23});
		else
			pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:1.0,height:0.23});
		if (pl.hp > 95){
			if (pl.dir)
				pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:15,yv:0,dur:1.7,atk:atk/5,width:1.0,height:0.23});
			else
				pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:-15,yv:0,dur:1.7,atk:atk/5,width:1.0,height:0.23});
		}
		}
	}//best sword
	,
	{
		stk:0,
		name:"cutter",
		cool:0.6,
		func:function(pl){
			var atk = 5;


			if (pl.dir)
				pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:15,yv:pl.yv,dur:1.7,atk:atk,width:1.0,height:0.23});
			else
				pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:-15,yv:pl.yv,dur:1.7,atk:atk,width:1.0,height:0.23});
		}
	}//cutter
	,{
		stk:0,
		name:"great cutter",
		cool:0.6,
		func:function(pl){
			var atk = 10;


			if (pl.dir)
				pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:15,yv:pl.yv,dur:1.7,atk:atk,width:1.0,height:0.23});
			else
				pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:-15,yv:pl.yv,dur:1.7,atk:atk,width:1.0,height:0.23});
		}
	}//good cutter
	,{
		stk:0,
		name:"master cutter",
		cool:0.6,
		func:function(pl){
			var atk = 20;


			if (pl.dir)
				pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:15,yv:pl.yv,dur:1.7,atk:atk,width:1.0,height:0.23});
			else
				pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:-15,yv:pl.yv,dur:1.7,atk:atk,width:1.0,height:0.23});
		}
	}//best cutter
	,
	{
		stk:0,
		name:"pubg weapon",
		cool:0.75,
		func:function(pl){
		var atk = 1;
		if (pl.dir){
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:17,yv:0,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16,yv:3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16,yv:-3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16.7,yv:1.5,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16.7,yv:-1.5,dur:2,atk:atk,width:0.3,height:0.3});

		}else{
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-17,yv:0,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16,yv:3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16,yv:-3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16.7,yv:1.5,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16.7,yv:-1.5,dur:2,atk:atk,width:0.3,height:0.3});
		}
		}
	},//pubg
	{
		stk:0,
		name:"good pubg weapon",
		cool:0.75,
		func:function(pl){
		var atk = 4;
		if (pl.dir){
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:17,yv:0,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16,yv:3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16,yv:-3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16.7,yv:1.5,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16.7,yv:-1.5,dur:2,atk:atk,width:0.3,height:0.3});

		}else{
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-17,yv:0,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16,yv:3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16,yv:-3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16.7,yv:1.5,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16.7,yv:-1.5,dur:2,atk:atk,width:0.3,height:0.3});
		}
		}
	},//good pubg
	{
		stk:0,
		name:"great pubg weapon",
		cool:0.75,
		func:function(pl){
		var atk = 8;
		if (pl.dir){
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:17,yv:0,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16,yv:3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16,yv:-3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16.7,yv:1.5,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16.7,yv:-1.5,dur:2,atk:atk,width:0.3,height:0.3});

		}else{
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-17,yv:0,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16,yv:3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16,yv:-3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16.7,yv:1.5,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16.7,yv:-1.5,dur:2,atk:atk,width:0.3,height:0.3});
		}
		}
	},//great pubg
	{
		stk:0,
		name:"master pubg weapon",
		cool:0.75,
		func:function(pl){
		var atk = 16;
		if (pl.dir){
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:17,yv:0,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16,yv:3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16,yv:-3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16.7,yv:1.5,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:16.7,yv:-1.5,dur:2,atk:atk,width:0.3,height:0.3});

		}else{
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-17,yv:0,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16,yv:3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16,yv:-3,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16.7,yv:1.5,dur:2,atk:atk,width:0.3,height:0.3});
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-16.7,yv:-1.5,dur:2,atk:atk,width:0.3,height:0.3});
		}
		}
	},//best pubg


	{
		stk:0,
		name:"WW2 weapon",
		cool:0.25,
		func:function(pl){
		var atk = 10;
		pl.hp/=2;
		if (pl.hp < 1)
			pl.hp = -1;
		pl.pjs.push({x:pl.x,y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:10,height:10});
		itemtypes[sitm].stk = 0;
		}
	}//WW2
	,{
		stk:0,
		name:"great WW2 weapon",
		cool:0.25,
		func:function(pl){
		var atk = 25;
		pl.hp/=2;
		if (pl.hp < 1)
			pl.hp = -1;
		pl.pjs.push({x:pl.x,y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:10,height:10});
		itemtypes[sitm].stk = 0;
		}
	}//good WW2
	,{
		stk:0,
		name:"master WW2 weapon",
		cool:0.25,
		func:function(pl){
		var atk = 50;
		pl.hp/=2;
		if (pl.hp < 1)
			pl.hp = -1;
		pl.pjs.push({x:pl.x,y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:10,height:10});
		itemtypes[sitm].stk = 0;
		}
	}//best WW2
	,


	{
		stk:0,
		name:"megaman's bane",
		cool:1.0,
		func:function(pl){
			var atk = 1;
			for (var i = 0 ; i < 16 ; i++){
				var t = i/16;
				pl.pjs.push({x:pl.x,y:pl.y,xv:Math.cos(Math.PI*t*2)*10,yv:Math.sin(Math.PI*t*2)*10,dur:1.3,atk:atk,width:0.3,height:0.3});
			}
		}
	},//megaman
	{
		stk:0,
		name:"good megaman's bane",
		cool:1.0,
		func:function(pl){
			var atk = 3;
			for (var i = 0 ; i < 16 ; i++){
				var t = i/16;
				pl.pjs.push({x:pl.x,y:pl.y,xv:Math.cos(Math.PI*t*2)*10,yv:Math.sin(Math.PI*t*2)*10,dur:1.3,atk:atk,width:0.3,height:0.3});
			}
		}
	},//good megaman
	{
		stk:0,
		name:"great megaman's bane",
		cool:1.0,
		func:function(pl){
			var atk = 6;
			for (var i = 0 ; i < 16 ; i++){
				var t = i/16;
				pl.pjs.push({x:pl.x,y:pl.y,xv:Math.cos(Math.PI*t*2)*10,yv:Math.sin(Math.PI*t*2)*10,dur:1.3,atk:atk,width:0.3,height:0.3});
			}
		}
	},//great megaman
	{
		stk:0,
		name:"master megaman's bane",
		cool:1.0,
		func:function(pl){
			var atk = 12;
			for (var i = 0 ; i < 16 ; i++){
				var t = i/16;
				pl.pjs.push({x:pl.x,y:pl.y,xv:Math.cos(Math.PI*t*2)*10,yv:Math.sin(Math.PI*t*2)*10,dur:1.3,atk:atk,width:0.3,height:0.3});
			}
		}
	},//best megaman



	{
		stk:0,
		name:"food blek",
		cool:10,
		func:function(pl){
			pl.hp+=1;
			pl.hp = Math.min(100,pl.hp);
			itemtypes[sitm].stk--;
		}
	},//food
	{
		stk:0,
		name:"dairy",
		cool:10,
		func:function(pl){
			pl.hp+=10;
			pl.hp = Math.min(100,pl.hp);
			itemtypes[sitm].stk--;
		}
	},//dairy
	{
		stk:0,
		name:"cheese",
		cool:10,
		func:function(pl){
			pl.hp+=25;
			pl.hp = Math.min(100,pl.hp);
			itemtypes[sitm].stk--;
		}
	},//cheese
	{
		stk:0,
		name:"cheese cake",
		cool:10,
		func:function(pl){
			pl.hp=100;
			itemtypes[sitm].stk = 0;
		}
	}//cheese cake
];
var plsize =0;

var characters = [
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image()
];


	characters[0].src = 'static/img/man1.png';
	characters[1].src = 'static/img/man2.png';
	characters[2].src = 'static/img/man3.png';
	characters[3].src = 'static/img/tman.png'

	characters[4].src = 'static/img/girl1.png'
	characters[5].src = 'static/img/girl2.png'

	characters[6].src = 'static/img/bike.png';
	characters[7].src = 'static/img/bike2.png';

	characters[8].src = 'static/img/bot.png';
	characters[9].src = 'static/img/pinkbot.png';

	characters[10].src = 'static/img/dog.png'
	characters[11].src = 'static/img/cat.png'
var spsize = 64;

var cool = 0.0;
setInterval(function() {
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    plsize = canvas.height/16;

    var trectangle = {top:(-canvas.height/2/plsize+mee.y)-0.3,bottom:(canvas.height/2/plsize+mee.y)+0.3,left:(-canvas.width/2/plsize+mee.x)-0.3,right:(canvas.width/2/plsize+mee.x)+0.3};

	var drawnd = []
	for (var i = 0; i < decor.length; i++) {
        if (intersectRect(decor[i],trectangle)){
			drawnd.push(decor[i]);
		}
	}
	context.fill();
	if (drawnd[0])context.fillStyle = drawnd[0].col;
	context.beginPath();
    for (var i = 0; i < drawnd.length; i++) {

            context.rect(((drawnd[i].left-mee.x)*plsize+canvas.width/2),((drawnd[i].top-mee.y)*plsize+canvas.height/2),(drawnd[i].right-drawnd[i].left)*plsize,(drawnd[i].bottom-drawnd[i].top)*plsize);
            if (i == drawnd.length-1){
				context.fill();
			}else if (drawnd[i+1].col!=drawnd[i]){
			context.fill();
			context.fillStyle = drawnd[i+1].col;
            context.beginPath();
			}
    }


	var drawn = []
	for (var i = 0; i < ground.length; i++) {
        if (intersectRect(ground[i],trectangle)){
			drawn.push(ground[i]);
		}
	}
	context.fillStyle = "rgb(50,50,50)";
    context.beginPath();
	for (var i = 0; i < drawn.length; i++) {
        context.rect(((drawn[i].left-mee.x)*plsize+canvas.width/2)+plsize/5,((drawn[i].top-mee.y)*plsize+canvas.height/2)+plsize/5,(drawn[i].right-drawn[i].left)*plsize,(drawn[i].bottom-drawn[i].top)*plsize);

    }
	context.fill();
	if (drawn[0])context.fillStyle = drawn[0].col;
	context.beginPath();
    for (var i = 0; i < drawn.length; i++) {

            context.rect(((drawn[i].left-mee.x)*plsize+canvas.width/2),((drawn[i].top-mee.y)*plsize+canvas.height/2),(drawn[i].right-drawn[i].left)*plsize,(drawn[i].bottom-drawn[i].top)*plsize);
            if (i == drawn.length-1){
				context.fill();
			}else if (drawn[i+1].col!=drawn[i]){
			context.fill();
			context.fillStyle = drawn[i+1].col;
            context.beginPath();
			}
    }


	var drawnt = []
	for (var i = 0; i < triggers.length; i++) {
        if (intersectRect(triggers[i],trectangle)){
			drawnt.push(triggers[i]);
		}
	}
	context.strokeStyle = "red";
	context.fillStyle = "black";
	context.font = "20px Verdana";
	context.lineWidth = plsize/10.0;
	context.beginPath();
    for (var i = 0; i < drawnt.length; i++) {
		context.rect(((drawnt[i].left-mee.x)*plsize+canvas.width/2),((drawnt[i].top-mee.y)*plsize+canvas.height/2),(drawnt[i].right-drawnt[i].left)*plsize,(drawnt[i].bottom-drawnt[i].top)*plsize);
    }
	context.stroke();
	for (var i = 0; i < drawnt.length; i++) {
		if (drawnt[i].name != " "){
			var tstr = drawnt[i].name.toString()+ ((drawnt[i].cool>0)?":"+Math.floor(Math.max(drawnt[i].cool,0)).toString():"");
			context.fillText(tstr, (((((drawnt[i].left+drawnt[i].right)/2.0)-mee.x)*plsize+canvas.width/2))-(context.measureText(tstr).width/2) ,(((((drawnt[i].top+drawnt[i].bottom)/2.0)-mee.y)*plsize+canvas.height/2))-8 );
		}
	}



	for (var i = 0; i < mee.pjs.length; i++) {
			context.fillStyle = 'blue';
            context.beginPath();
            context.rect(((mee.pjs[i].x-mee.x)*plsize+canvas.width/2)-plsize*mee.pjs[i].width,((mee.pjs[i].y-mee.y)*plsize+canvas.height/2)-plsize*mee.pjs[i].height,mee.pjs[i].width*2*plsize,mee.pjs[i].height*2*plsize);
            context.fill();
	}

	context.drawImage(characters[mee.char],0,mee.anim*spsize,spsize,spsize,(canvas.width/2)-plsize/2,(canvas.height/2)-plsize/2,plsize,plsize);

	var tpls = 0;

	for (var id in cplayers) {
        tpls++;
		if (id != socket.id){
			var player = cplayers[id] || {};
			context.fillStyle = 'red';
			context.beginPath();
			for (var i = 0; i < player.pjs.length; i++) {
				context.rect(((player.pjs[i].x-mee.x)*plsize+canvas.width/2)-plsize*player.pjs[i].width,((player.pjs[i].y-mee.y)*plsize+canvas.height/2)-plsize*player.pjs[i].height,player.pjs[i].width*2*plsize,player.pjs[i].height*2*plsize);

			}
            context.fill();
            //context.fillStyle = 'red';
            //context.beginPath();
            //context.rect(((player.x-mee.x)*plsize+canvas.width/2)-plsize/2,((player.y-mee.y)*plsize+canvas.height/2)-plsize/2,plsize,plsize);
            //context.fill();
			context.fillStyle = 'red';
			context.font = "16px Verdana";
			context.fillText(Math.floor(player.hp), ((player.x-mee.x)*plsize+canvas.width/2)-plsize/2,((player.y-mee.y)*plsize+canvas.height/2)-plsize/2);
			context.fillStyle = 'rgb(255, 153, 0)';
			context.font = "16px Verdana";
			context.fillText(player.score, ((player.x-mee.x)*plsize+canvas.width/2)-plsize/2,(((player.y-mee.y)*plsize-15)+canvas.height/2)-plsize/2);
			context.fillStyle = 'black';
			context.font = "16px Verdana";
			context.fillText(player.name, ((player.x-mee.x)*plsize+canvas.width/2)-plsize/2,(((player.y-mee.y)*plsize-30)+canvas.height/2)-plsize/2);
			if (intersectRect(trectangle,{top:player.y-0.5,bottom:player.y+0.5,right:player.x+0.5,left:player.x-0.5})){
				context.drawImage(characters[player.char],0,player.anim*spsize,spsize,spsize,((player.x-mee.x)*plsize+canvas.width/2)-plsize/2,((player.y-mee.y)*plsize+canvas.height/2)-plsize/2,plsize,plsize);
			}else
				{
					var num = 0.1*Math.sqrt((player.x-mee.x)*(player.x-mee.x)+(player.y-mee.y)*(player.y-mee.y));
					var num = ((1.0/num)>0.1?num:0);
					context.fillStyle = 'white';
					context.beginPath();
					context.arc(Math.max(Math.min(((player.x-mee.x)*plsize+canvas.width/2),canvas.width),0),Math.max(Math.min(((player.y-mee.y)*plsize+canvas.height/2),canvas.height),0), plsize/(1.0*num), 0, 2 * Math.PI);
					context.fill();
					context.fillStyle = 'red';
					context.beginPath();
					context.arc(Math.max(Math.min(((player.x-mee.x)*plsize+canvas.width/2),canvas.width),0),Math.max(Math.min(((player.y-mee.y)*plsize+canvas.height/2),canvas.height),0), plsize/(1.4*num), 0, 2 * Math.PI);
					context.fill();

				}
        }
    }


	var count = 0;
	for (var i = 0 ; i < itemtypes.length ; i++)
		if (itemtypes[i].stk)
			count+=1;
	context.fillStyle = 'rgba(125, 125, 125,0.5)';
    context.beginPath();
    context.rect( 4,0,16*16,count*16+8);
    context.fill();

    context.font = "16px Verdana";
	context.fillStyle = 'rgba(125, 125, 125,0.5)';
    context.beginPath();
    context.rect( canvas.width-Math.max(context.measureText("<"+mee.name+">        ").width,context.measureText("<"+"            "+">        ").width),0,Math.max(context.measureText("<"+mee.name+">       ").width,context.measureText("<"+"            "+">       ").width ) , 4*16+8);
    context.fill();

	//context.fillStyle = 'blue';
    //context.beginPath();
    //context.rect((canvas.width/2)-plsize/2,(canvas.height/2)-plsize/2,plsize,plsize);
    //context.fill();


	var temppl = [];
	for (var id in cplayers)
		temppl.push(cplayers[id]);
	temppl.sort(function(a,b){return b.score-a.score;})

	context.fillStyle = 'blue';
	context.font = "16px Verdana";
	context.fillText("CD:"+Math.max(Math.floor(cool*10),0), (canvas.width)-context.measureText("CD:"+Math.max(Math.floor(cool*10),0)+"  ").width,64);
	context.fillStyle = 'red';
	context.font = "16px Verdana";
	context.fillText("HP:"+Math.floor(mee.hp), (canvas.width)-context.measureText("HP:"+Math.floor(mee.hp)+"  ").width,48);
	context.fillStyle = 'rgba(255, 153, 0,255)';
	context.font = "16px Verdana";
	context.fillText("score:"+mee.score, (canvas.width)-context.measureText("score:"+mee.score+"  ").width,32);
	context.fillStyle = 'black';
	context.font = "16px Verdana";
	context.fillText("<"+mee.name+">", (canvas.width)-context.measureText("<"+mee.name+">  ").width,16);
	context.fillStyle = 'rgba(0,0,0,0.6)';
	context.fillText("online:"+tpls, 8,canvas.height-16);
	context.fillStyle = 'rgba(0,0,0,0.6)';
	if (temppl[0])
	context.fillText("1st [ "+temppl[0].name+":"+temppl[0].score+" ]", (canvas.width)-context.measureText("1st [ "+temppl[0].name+":"+temppl[0].score+" ]  ").width,canvas.height-48);
	if (temppl[1])
	context.fillText("2nd [ "+temppl[1].name+":"+temppl[1].score+" ]", (canvas.width)-context.measureText("2nd [ "+temppl[1].name+":"+temppl[1].score+" ]  ").width,canvas.height-32);
	if (temppl[2])
	context.fillText("3rd [ "+temppl[2].name+":"+temppl[2].score+" ]", (canvas.width)-context.measureText("3rd [ "+temppl[2].name+":"+temppl[2].score+" ]  ").width,canvas.height-16);

	context.fillStyle = 'black';
	var index = 0;
	for (var i = 0 ; i < itemtypes.length ; i++){
		if (i == sitm){
			if (itemtypes[i].stk){
				context.fillText(">"+itemtypes[i].name+((itemtypes[i].stk>1)?":"+itemtypes[i].stk:"")+"<", 8,16+index*16);
				index+=1;
			}
		}
		else
			if (itemtypes[i].stk){

				context.fillText(itemtypes[i].name+((itemtypes[i].stk>1)?":"+itemtypes[i].stk:""), 8,16+index*16);
				index+=1;
			}
	}

	if (isMobile){
		context.fillStyle = 'black';
		context.font = "80px Verdana";
		context.fillText("<", 0,canvas.height-80);
		context.fillStyle = 'black';
		context.font = "80px Verdana";
		context.fillText(">", 80,canvas.height-80);
		context.fillStyle = 'black';
		context.font = "80px Verdana";
		context.fillText("C", canvas.width-240,canvas.height-80);
		context.fillStyle = 'black';
		context.font = "80px Verdana";
		context.fillText("X", canvas.width-160,canvas.height-80);
		context.fillStyle = 'black';
		context.font = "80px Verdana";
		context.fillText("Z", canvas.width-80,canvas.height-80);
	}

}, 1000/60);

mee.name = prompt("Username:\ncontrols:z/space/up-jump   x-use item   c-change item   left/right-move", "");
var listc = {
	"man1" : 0,
	"cheeseman" : 0,
	"mancheese" : 0,
	"man2" : 1,
	"man":1,
	"redman":1,
	"manred":1,
	"mario":1,
	"mario?":1,
	"mario??":1,
	"mario???":1,
	"man3" : 2,
	"greenman" : 2,
	"mangreen" : 2,
	"luigi" : 2,
	"luigi?" : 2,
	"luigi??" : 2,
	"luigi???" : 2,
	"tman" : 3,
	"tshirtman" : 3,
	"mantshirt" : 3,
	"girl1" : 4,
	"girl":4,
	"pinkgirl":4,
	"girlpink" : 5,
	"girl2" : 5,
	"bluegirl" : 5,
	"girlblue" : 5,
	"bike" : 6,
	"bike1" : 6,
	"redbike" : 6,
	"bikered" : 6,
	"bike2" : 7,
	"bluebike" : 7,
	"bikeblue" : 7,
	"bot" : 8,
	"bluebot" : 8,
	"botblue" : 8,
	"manbot" : 8,
	"botman" : 8,
	"pinkbot" : 9,
	"botpink" : 9,
	"girlbot" : 9,
	"botgirl" : 9,
	"cat" : 11,
	"dog" : 10,
}
var tchar = prompt("Player:\n0:cheese man\n1:red man\n2:green man\n3:tshirt? man\n4:pink girl\n5:blue girl\n6:red bike\n7:blue bike\n8:blue bot\n9:pink bot\n10:dog\n11:cat","");

if (tchar){
if (characters[tchar])
	mee.char = +tchar;
else{
	if (listc[tchar.replace(/\s/g, '').toLowerCase()])
		mee.char = listc[tchar.replace(/\s/g, '').toLowerCase()];
	else
		mee.char = 0;
}
}

var lastUpdateTime = performance.now();

var hit = 0.0;
var animspd = 0;
var animtime = 0.1;
var punchanim = -0.1;


var thp = 0.0;
var sfoot = new Audio('static/sound/foot.mp3');
var spunch = new Audio('static/sound/punch.mp3');
var sjump = new Audio('static/sound/jump.mp3');
var sslide = new Audio('static/sound/slide.mp3');
setInterval(function() {
  if (jump.right||jump.left){
    sslide.play();
  }else{
    sslide.pause();
  }
	var currentTime = performance.now();
    var dt = (currentTime - lastUpdateTime)/1000.0;
	animtime+=dt;
	punchanim-=dt;
	thp+= dt;
	if (thp>7.0){
	thp=0;
	mee.hp++;
	if (mee.hp > 100)
		mee.hp = 100;
	}
	if (animtime>(1.0/animspd)){
		if (mee.anim == 0)
			mee.anim = 2;
		else if (mee.anim == 2)
			mee.anim = 0;
		if (mee.anim == 1)
			mee.anim = 3;
		else if (mee.anim == 3)
			mee.anim = 1;

		if (mee.anim == 10){
			mee.anim = 12;
      sfoot.pause();
      sfoot.fastSeek(0);
      sfoot.play();
    }
		else if (mee.anim == 12)
			mee.anim = 10;

		if (mee.anim == 11){
			mee.anim = 13;
      sfoot.pause();
      sfoot.fastSeek(0);
      sfoot.play();
    }
		else if (mee.anim == 13)
			mee.anim = 11;
		animtime = 0;
	}

	invincibility-=dt;
	if (invincibility>0){
		mee.hp = 100.0;
	}
	if (mee.hp <= 0)
		{
			mee = {
				x  : 0.0,
				y  : 0.0,
				xv : 0.0,
				yv : 0.0,
				hp : 100.0,
				dir : false,
				pjs : [],//x,y,xv,yv,atk,dur,size
				score : mee.score-1,
				name : mee.name,
				anim : 0,
				char : mee.char
			};
			//items = [0];
			itemtypes[0].stk=1;
			for (var i = 1 ; i < itemtypes.length ; i++){
				itemtypes[i].stk = 0;
			}
			sitm = 0;
		}

    const spd = 10;
    mee.yv += 13*dt;
	cool-=dt;

	if (isMobile){
		keysdown.up     = false;
		keysdown.left   = false;
		keysdown.right  = false;
		keysdown.use    = false;
		keysdown.switch = false;
		for (var i = 0 ; i < ongoingTouches.length ; i += 1){
			if (ongoingTouches[i].pageX<80)
				keysdown.left = true;
			else if (ongoingTouches[i].pageX<160){
				keysdown.right = true;
			}
			else if (ongoingTouches[i].pageX<canvas.width-160){
				keysdown.switch = true;
			}
			else if (ongoingTouches[i].pageX<canvas.width-80){
				keysdown.use = true;
			}
			else {
				keysdown.up = true;
			}
		}
	}
	if (keysdown.switch && !keysdown.pswitch){
		sitm+=1;sitm%=itemtypes.length;
		while (!(itemtypes[sitm].stk)){
			sitm+=1;sitm%=itemtypes.length;
		}
	}
		//if (keysdown.right && !keysdown.pright)
		//{
		//	sitm+=1;
		//	sitm%=items.length;
		//}
		//if (keysdown.left && !keysdown.pleft)
		//{
		//	sitm-=1;
		//	if (sitm<0)
		//		sitm=items.length-1;
		//}


		if (keysdown.up && !keysdown.pup)
		{
      sjump.pause();
      sjump.fastSeek(0);
      sjump.play();
			if (jump.up){
				mee.yv = -10;
			}else{
				if (((jump.left&& mee.dir) || (jump.right&& !mee.dir))){

					if (jump.left&& mee.dir){
						mee.yv = -10;
						mee.xv = -7;
					}
					if (jump.right&& !mee.dir){
						mee.yv = -10;
						mee.xv = 7;
					}
				}else{
            if (mee.dir)
							mee.xv = 12;
						else
							mee.xv = -12;

				}

			}

		}
		if (keysdown.use)
		{
		if (cool <= 0.0){
      spunch.pause();
      spunch.fastSeek(0);
      spunch.play();
			if (itemtypes[sitm].stk>0){
				itemtypes[sitm].func(mee);
				cool = itemtypes[sitm].cool;
				punchanim = Math.min(cool/2.0,0.5);
			}
		}
		}
		if (keysdown.right)
		{
			mee.dir = true;
			if (jump.up){
				if (mee.xv < 0)
					mee.xv += 2*spd*dt;
				mee.xv += 2*spd*dt;
			}
			else
				mee.xv += spd*dt;
		}
		if (keysdown.left)
		{
			mee.dir = false;
		    if (jump.up){
				if (mee.xv > 0)
					mee.xv -= 2*spd*dt;
				mee.xv -= 2*spd*dt;
			}
			else
				mee.xv -= spd*dt;
		}

	keysdown.pup = keysdown.up;
	keysdown.pleft = keysdown.left;
	keysdown.pright = keysdown.right;
	keysdown.puse = keysdown.use;
	keysdown.pswitch = keysdown.switch;



    var steps = Math.floor(Math.sqrt(mee.xv*mee.xv+mee.yv*mee.yv)*2.0);
    var altdt = dt/steps;
    //console.log(1.0/dt);
	for (var i = 0 ; i < triggers.length ; i++ )
		triggers[i].cool -= dt;
    for (var it = 0; it < steps; it++) {
        //for (var id in cplayers) {
        //    if (id != socket.id){
        //        collidepl(mee,cplayers[id]);
        //    }
        //}
		if (Math.abs(mee.xv) > 0.001)
            mee.x += mee.xv*altdt;
        if (Math.abs(mee.yv) > 0.001)
            mee.y += mee.yv*altdt;

        for (var i = 0; i < ground.length; i++) {
            collide(mee,ground[i]);
        }

        var plrect = {top:mee.y-0.5,bottom:mee.y+0.5,right:mee.x+0.5,left:mee.x-0.5};
		for (var i = 0 ; i < triggers.length ; i++ ){
			if (triggers[i].cool < 0 && intersectRect(plrect,triggers[i])){
				tfuncs[triggers[i].func](mee);
				triggers[i].cool = 20.0;
			}
		}
		for (var id in cplayers) {
		    if (id != socket.id){
				var player = cplayers[id] || {};
				for (var i = 0; i < player.pjs.length; i++) {
					if (intersectRect(plrect,
						{top:player.pjs[i].y-player.pjs[i].height,bottom:player.pjs[i].y+player.pjs[i].height,right:player.pjs[i].x+player.pjs[i].width,left:player.pjs[i].x-player.pjs[i].width})){
						if (hit <= 0.0){
							mee.hp-=player.pjs[i].atk;
							hit = 0.3;
							if (mee.hp <= 0.0){
								socket.emit('d',id);
							}
						}
					}
				}
			}
		}
    }
    //for (var id in cplayers) {
    //    if (id != socket.id){
    //        collidepl(mee,cplayers[id]);
    //    }
    //}
    jump = {up:false,left:false,right:false};
	for (var i = 0; i < ground.length; i++) {
       collide(mee,ground[i]);
	}

    const f = 3;
	if (jump.left  && mee.dir){
		mee.yv = Math.min(mee.yv,3);
	}
	if (jump.right  && !mee.dir){
		mee.yv = Math.min(mee.yv,3);
	}

	if (jump.up)
	{
		if (keysdown.right || keysdown.left)
		{
			animspd=Math.abs(mee.xv)/1.5;
			if (mee.dir){
				if (!(mee.anim == 10 || mee.anim == 12))
					mee.anim = 10;
			}else{
				if (!(mee.anim == 11 || mee.anim == 13))
					mee.anim = 11;
			}
		}else{
			animspd=1;
			if (mee.dir){
				if (!(mee.anim == 0 || mee.anim == 2))
					mee.anim = 0;
			}else{
				if (!(mee.anim == 1 || mee.anim == 3))
					mee.anim = 1;
			}
		}
		mee.xv = Math.max(-17, Math.min(mee.xv, 17));

		if (mee.xv > 0.03)
		    {mee.xv -= f*dt*1.75;}
		else if (mee.xv < -0.03)
		    {mee.xv += f*dt*1.75;}
		else
		    {mee.xv = 0;}
	}
	else{
		if (mee.yv > 0){
			if (mee.dir){
				mee.anim=8;
			}else{
				mee.anim=9;
			}
		}else{
			if (mee.dir){
				mee.anim=6;
			}else{
				mee.anim=7;
			}
		}
		if (mee.xv > 0.03)
		    {mee.xv -= f*dt;}
		else if (mee.xv < -0.03)
		    {mee.xv += f*dt;}
		else
		    {mee.xv = 0;}
	}

	if (mee.yv > 0.1)
		{
			if (jump.left && mee.dir)
				mee.anim = 4;
			if (jump.right && !mee.dir)
				mee.anim = 5;
		}

    if (mee.yv > 0.03)
        {mee.yv -= f*dt;}
    else if (mee.yv < -0.03)
        {mee.yv += f*dt;}
    else
        {mee.yv = 0;}


	if (punchanim>0.0){
		if (mee.dir){
			mee.anim=14;
		}else{
			mee.anim=15;
		}
	}

	for (var i = 0; i < mee.pjs.length; i++) {
		mee.pjs[i].x+=mee.pjs[i].xv*dt;
		mee.pjs[i].y+=mee.pjs[i].yv*dt;
		mee.pjs[i].dur-=dt;
	}

	hit -= dt;

    lastUpdateTime = currentTime;

}, 1000/60);
