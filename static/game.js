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
    mxhp : 100.0,
	dir : false,
	pjs : [],//x,y,xv,yv,atk,dur,size
	score : 0,
	name : "loading...",
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
    if (intersectRect({top:pl.y-0.5,bottom:pl.y+0.5,right:pl.x+0.5-(jump.up?0.02:0.0),left:pl.x-0.5+(jump.up?0.02:0.0)},r)){
		var roff=Math.abs(pl.x-0.5-r.right);
		var loff=Math.abs(pl.x+0.5-r.left);
		if (Math.abs(r.top-0.5-pl.y) < 0.6 && pl.yv>-0.1){
            if (roff < 0.1 && jump.right){
                pl.x = r.right+0.49;
                if (pl.xv<0.0)
                    pl.xv = 0.0;
				jump.right=true;
            }else if (loff < 0.1 && jump.left){
                pl.x = r.left-0.49;
                if (pl.xv>0.0)
                    pl.xv = 0.0;
				jump.left=true;
            }else
            {
                pl.y = r.top-0.499;
                if (pl.yv>0.0)
			        pl.yv = 0.0;
			    jump.up=true;
            }
         }else{
            if (pl.x-((r.left+r.right)/2.0) < 0){
                if (Math.abs(r.left-0.5-pl.x) < 0.6){
                    pl.x = r.left-0.49;
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
                    pl.x = r.right+0.49;
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

var isMobile = !!(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
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

var ground = rawlvl["ground"];
var decor = rawlvl["decor"];
var triggers = rawlvl["triggers"];
if (!triggers)
	triggers = [];







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

function itemlvl(){
    var lvl = 1;
    if (itemtypes[sitm]["upgrades"]){
        lvl=0;
        for (var i = 0 ; i < itemtypes[sitm].upamnt ; i++)
            if (itemtypes[sitm]["upgrades"][i])
                lvl++;    
    }
    return lvl;
}
function itemlvls(itm){
    var lvl = 1;
    if (itm["upgrades"]){
        lvl=0;       
        for (var i = 0 ; i < itm.upamnt ; i++)
            if (itm["upgrades"][i])
               lvl++;    
    }
    return lvl;
}
var itemtypes = [
	{
		stk:1,
		name:"fist",
		cool:0.25,
        upamnt:2,
        upgrades:[true,false],


		func:function(pl){
		var atk=1;
        var lvl = itemlvl();
        if (lvl == 2)
            atk=15;
        if (lvl == 2)
            atk=15;
		if (pl.dir)
			pl.pjs.push({x:pl.x+0.75,y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:0.25,height:0.25});
		else
			pl.pjs.push({x:pl.x-0.75,y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:0.25,height:0.25});
		}
	}//fist
	
	,
	{
		stk:0,
		name:"pew pew",
		cool:0.3,
        upamnt:4,
        upgrades:[false,false,false,false],
		
        func:function(pl){
		var atk = 1;
        var lvl = itemlvl();
        if (lvl == 2)
            atk=5;
        if (lvl == 3)
            atk=10;
        if (lvl == 4)
            atk=20;

		if (pl.dir)
			pl.pjs.push({x:pl.x+1.0,y:pl.y,xv:20,yv:0,dur:6,atk:atk,width:0.3,height:0.3});
		else
			pl.pjs.push({x:pl.x-1.0,y:pl.y,xv:-20,yv:0,dur:6,atk:atk,width:0.3,height:0.3});
		}
	}//pew pew
	
	
	
	,
	{
		stk:0,
		name:"sword",
		cool:0.75,
        
        upamnt:3,
        upgrades:[false,false,false],
        
		func:function(pl){
		var atk = 15;
        
        var lvl = itemlvl();
        if (lvl == 2)
            atk=30;
        if (lvl == 3)
            atk=50;

		if (pl.dir)
			pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:1.0,height:0.23});
		else
			pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:1.0,height:0.23});
		if (pl.hp > pl.mxhp*0.9){
			if (pl.dir)
				pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:15,yv:0,dur:1.7,atk:atk/5,width:1.0,height:0.23});
			else
				pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:-15,yv:0,dur:1.7,atk:atk/5,width:1.0,height:0.23});
		}
		}
	}//sword
	
	
	,
	{
		stk:0,
		name:"cutter",
		cool:0.6,
        upamnt:3,
        upgrades:[false,false,false],

		func:function(pl){
			var atk = 8;
            var lvl = itemlvl();
            if (lvl == 2)
                atk=15;
            if (lvl == 3)
                atk=30;

            var len = Math.sqrt(pl.xv*pl.xv+pl.yv*pl.yv);

			if (pl.dir)
				pl.pjs.push({x:pl.x+(1.0+0.5),y:pl.y,xv:(pl.xv/len)*19,yv:(pl.yv/len)*19,dur:6,atk:atk,width:0.5,height:0.5});
			else
				pl.pjs.push({x:pl.x-(1.0+0.5),y:pl.y,xv:(pl.xv/len)*19,yv:(pl.yv/len)*19,dur:6,atk:atk,width:0.5,height:0.5});
		}
	}//cutter
	
	
	,
	{
		stk:0,
		name:"pubg weapon",
		cool:1.4,

        upamnt:4,
        upgrades:[false,false,false,false],

		func:function(pl){
		var atk = 1;
        var lvl = itemlvl();
        if (lvl == 2)
            atk=3;
        if (lvl == 3)
            atk=5;
        if (lvl == 4)
            atk=10;

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
		name:"WW2 weapon",
		cool:0.25,
        upamnt:3,
        upgrades:[false,false,false],        
        
		func:function(pl){
		var atk = 20;
        var lvl = itemlvl();
        if (lvl == 2)
            atk=40;
        if (lvl == 3)
            atk=90;


		pl.hp/=1.3;
		if (pl.hp < 1)
			pl.hp = -1;
		pl.pjs.push({x:pl.x,y:pl.y,xv:pl.xv,yv:pl.yv,dur:0.1,atk:atk,width:10,height:10});
		itemtypes[sitm].stk = 0;
		}
	},//WW2
	{
		stk:0,
		name:"megaman's bane",
		cool:1.0,
        upamnt:4,
        upgrades:[false,false,false,false],
        
		func:function(pl){
			var atk = 1;
            var lvl = itemlvl();
            if (lvl == 2)
                atk=2;
            if (lvl == 3)
                atk=4;
            if (lvl == 4)
                atk=6;
			for (var i = 0 ; i < 16 ; i++){
				var t = i/16;
				pl.pjs.push({x:pl.x,y:pl.y,xv:Math.cos(Math.PI*t*2)*10,yv:Math.sin(Math.PI*t*2)*10,dur:1.3,atk:atk,width:0.3,height:0.3});
			}
		}
	},//megaman



	{
		stk:0,
		name:"normal food",
		cool:4,
		func:function(pl){
			pl.hp+=1;
			pl.hp = Math.min(pl.mxhp,pl.hp);
			itemtypes[sitm].stk--;
		}
	},//food
	{
		stk:0,
		name:"dairy",
		cool:4,
		func:function(pl){
			pl.hp+=10;
			pl.hp = Math.min(pl.mxhp,pl.hp);
			itemtypes[sitm].stk--;
		}
	},//dairy
	{
		stk:0,
		name:"cheese",
		cool:4,
		func:function(pl){
			pl.hp+=25;
			pl.hp = Math.min(pl.mxhp,pl.hp);
			itemtypes[sitm].stk--;
		}
	},//cheese
	{
		stk:0,
		name:"cheese cake",
		cool:2,
		func:function(pl){
			pl.hp=pl.mxhp;
			itemtypes[sitm].stk = 0;
		}
	}//cheese cake
];

var tfuncs = [

]

for (var i = 0; i < 7 ; i++){
    for (var j = 0; j < itemtypes[i].upamnt ; j++){
	    tfuncs.push(new Function("pl", "itemtypes["+i+"].stk=1;if(!itemtypes["+i+"][\"upgrades\"]["+j+"])itemtypes["+i+"][\"upgrades\"]["+j+"]=true;"));
    }
}
var invincibility = 0;
tfuncs.push(function(pl){if (itemtypes[7].stk < 32)itemtypes[7].stk++;});
tfuncs.push(function(pl){if (itemtypes[8].stk < 32)itemtypes[8].stk++;});
tfuncs.push(function(pl){if (itemtypes[9].stk < 32)itemtypes[9].stk++;});
tfuncs.push(function(pl){itemtypes[10].stk=1;});
tfuncs.push(function(pl){pl.hp=-1;});
tfuncs.push(function(pl){pl.hp = 1;});
tfuncs.push(function(pl){pl.hp -= 10;});
tfuncs.push(function(pl){pl.hp -= 50;});
tfuncs.push(function(pl){pl.hp = pl.hp / 2;if (pl.hp < 1) pl.hp = -1;});
tfuncs.push(function(pl){pl.hp = pl.hp / 4;if (pl.hp < 1) pl.hp = -1;});
tfuncs.push(function(pl){pl.hp -= 1;});
tfuncs.push(function(pl){invincibility = 60;cool=60;});
tfuncs.push(function(pl){pl.x = 0; pl.y = 0;pl.xv = 0; pl.yv = 0;});
tfuncs.push(function(pl){pl.x = -120.3; pl.y = 132.1});
tfuncs.push(function(pl){hit = 5.02;});
tfuncs.push(function(pl){pl.y = 132.1});
var Upgrades = [true,true,true,true,true,true,true,true];
tfuncs.push(function(pl){if (Upgrades[0]){pl.mxhp+=50;pl.hp+=50;Upgrades[0]=false;} });
tfuncs.push(function(pl){if (Upgrades[1]){pl.mxhp+=50;pl.hp+=50;Upgrades[1]=false;} });
tfuncs.push(function(pl){if (Upgrades[2]){pl.mxhp+=50;pl.hp+=50;Upgrades[2]=false;} });
tfuncs.push(function(pl){if (Upgrades[3]){pl.mxhp+=50;pl.hp+=50;Upgrades[3]=false;} });
tfuncs.push(function(pl){if (Upgrades[4]){pl.mxhp+=50;pl.hp+=50;Upgrades[4]=false;} });
tfuncs.push(function(pl){if (Upgrades[5]){pl.mxhp+=50;pl.hp+=50;Upgrades[5]=false;} });
tfuncs.push(function(pl){if (Upgrades[6]){pl.mxhp+=50;pl.hp+=50;Upgrades[6]=false;} });
tfuncs.push(function(pl){if (Upgrades[7]){pl.mxhp+=50;pl.hp+=50;Upgrades[7]=false;} });

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
characters[1].srct = 'static/img/man2.png';
characters[2].src = 'static/img/man3.png';

characters[3].src = 'static/img/girl1.png'
characters[4].src = 'static/img/girl2.png'

characters[5].src = 'static/img/bike.png';
characters[6].src = 'static/img/bike2.png';

characters[7].src = 'static/img/bot.png';
characters[8].src = 'static/img/pinkbot.png';

characters[9].src = 'static/img/dog.png'
characters[10].src = 'static/img/technopig.png'
characters[11].src = 'static/img/dreamy.png'
characters[12].src = 'static/img/annoyingdog.png'

characters[13].src = 'static/img/duane.png'
characters[14].src = 'static/img/leenk.png'
characters[15].src = 'static/img/markio.png'
characters[16].src = 'static/img/looogi.png'
characters[17].src = 'static/img/MRLoogi.png'
characters[18].src = 'static/img/kirbo.png'

var spsize;
spsize = 64;

var cool = 0.0;

var chat = ["","","","",""];

socket.on('c', function(message) {
   for (var i = 4 ; i > 0 ; i --)
   {
   		chat[i]=chat[i-1]
   } 
   chat[0]=message;
});

var gcol = function(rect){
	if (rect)
		return "rgb("+rect["colr"].toString()+","+rect["colg"].toString()+","+rect["colb"].toString()+")";
	else 
		return "blue";
}

var lvlnames = ["","good ","great ","master "]
setInterval(function() {
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (isMobile)
    plsize = canvas.height/16;
    else
    plsize = canvas.height/24;
    var trectangle = {top:(-canvas.height/2/plsize+mee.y)-0.3,bottom:(canvas.height/2/plsize+mee.y)+0.3,left:(-canvas.width/2/plsize+mee.x)-0.3,right:(canvas.width/2/plsize+mee.x)+0.3};

	var drawnd = [];
	for (var i = 0; i < decor.length; i++) {
        if (intersectRect(decor[i],trectangle)){
			drawnd.push(decor[i]);
		}
	}
    for (var i = 0; i < drawnd.length; i++) {
		context.fillStyle = gcol(drawnd[i]);
        context.beginPath();
        context.rect(((drawnd[i].left-mee.x)*plsize+canvas.width/2)-1,((drawnd[i].top-mee.y)*plsize+canvas.height/2)-1,(drawnd[i].right-drawnd[i].left)*plsize+1,(drawnd[i].bottom-drawnd[i].top)*plsize+1);
        context.fill();
    }


	var drawn = []
	for (var i = 0; i < ground.length; i++) {
        if (intersectRect(ground[i],trectangle)){
			drawn.push(ground[i]);
		}
	}
	context.fillStyle = "rgb(20,20,20)";
    context.beginPath();
	for (var i = 0; i < drawn.length; i++) {
        context.rect(((drawn[i].left-mee.x)*plsize+canvas.width/2)-plsize/20-1,((drawn[i].top-mee.y)*plsize+canvas.height/2)-plsize/20-1,(drawn[i].right-drawn[i].left)*plsize+plsize/10+1,(drawn[i].bottom-drawn[i].top)*plsize+plsize/10+1);

    }
	context.fill();
	
	
    for (var i = 0; i < drawn.length; i++) {
			context.fillStyle = gcol(drawn[i]);
			context.beginPath();
            context.rect(((drawn[i].left-mee.x)*plsize+canvas.width/2)-1,((drawn[i].top-mee.y)*plsize+canvas.height/2)-1,(drawn[i].right-drawn[i].left)*plsize+1,(drawn[i].bottom-drawn[i].top)*plsize+1);
            context.fill();
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
			context.fillText(Math.floor(player.hp)+"/"+Math.floor(player.mxhp), ((player.x-mee.x)*plsize+canvas.width/2)-plsize/2,((player.y-mee.y)*plsize+canvas.height/2)-plsize/2);
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
					var num = Math.min(Math.max(0.1*Math.sqrt((player.x-mee.x)*(player.x-mee.x)+(player.y-mee.y)*(player.y-mee.y)),1),8);
					context.fillStyle = 'white';
					context.beginPath();
					context.arc(Math.max(Math.min(((player.x-mee.x)*plsize+canvas.width/2),canvas.width),0),Math.max(Math.min(((player.y-mee.y)*plsize+canvas.height/2),canvas.height),0), plsize/(0.4*num), 0, 2 * Math.PI);
					context.fill();
					context.fillStyle = 'red';
					context.beginPath();
					context.arc(Math.max(Math.min(((player.x-mee.x)*plsize+canvas.width/2),canvas.width),0),Math.max(Math.min(((player.y-mee.y)*plsize+canvas.height/2),canvas.height),0), plsize/(0.7*num), 0, 2 * Math.PI);
					context.fill();

				}
        }else {
        	var player = cplayers[id] || {};
        	context.fillStyle = 'rgba(0,255,0,0.25)';
			context.beginPath();
			for (var i = 0; i < player.pjs.length; i++) {
				context.rect(((player.pjs[i].x-mee.x)*plsize+canvas.width/2)-plsize*player.pjs[i].width,((player.pjs[i].y-mee.y)*plsize+canvas.height/2)-plsize*player.pjs[i].height,player.pjs[i].width*2*plsize,player.pjs[i].height*2*plsize);

			}
            context.fill();
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
	context.fillText("HP:"+Math.floor(mee.hp)+"/"+Math.floor(mee.mxhp), (canvas.width)-context.measureText("HP:"+Math.floor(mee.hp)+"/"+Math.floor(mee.mxhp)+"  ").width,48);
	context.fillStyle = 'rgba(255, 153, 0,255)';
	context.font = "16px Verdana";
	context.fillText("score:"+mee.score, (canvas.width)-context.measureText("score:"+mee.score+"  ").width,32);
	context.fillStyle = 'black';
	context.font = "16px Verdana";
	context.fillText("<"+mee.name+">", (canvas.width)-context.measureText("<"+mee.name+">  ").width,16);
	context.fillStyle = 'rgba(0,0,0,0.6)';
	context.fillText("online:"+tpls, 8,canvas.height-16);
	context.fillText(chat[0], 8,canvas.height-68);
	context.fillText(chat[1], 8,canvas.height-84);
	context.fillText(chat[2], 8,canvas.height-100);
	context.fillText(chat[3], 8,canvas.height-116);
	context.fillText(chat[4], 8,canvas.height-132);
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
        var lvl = itemlvls(itemtypes[i]);
        var prefix = "";    
        if (lvl != 1){
            prefix = lvlnames[(4-itemtypes[i].upamnt)+lvl-1];
        }
            
	
        if (i == sitm){
			if (itemtypes[i].stk){
				context.fillText(">"+prefix+itemtypes[i].name+((itemtypes[i].stk>1)?":"+itemtypes[i].stk:"")+"<", 8,16+index*16);
				index+=1;
			}
		}
		else
			if (itemtypes[i].stk){

				context.fillText(prefix+itemtypes[i].name+((itemtypes[i].stk>1)?":"+itemtypes[i].stk:""), 8,16+index*16);
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

var sfoot = new Audio('static/sound/foot.mp3');
var spunch = new Audio('static/sound/punch.mp3');
var sjump = new Audio('static/sound/jump.mp3');
var sslide = new Audio('static/sound/slide.mp3');
sfoot.volume = 0.4;
spunch.volume = 0.2;
sjump.volume = 0.2;
sslide.volume = 0.2;



var startgame = false;



var lastUpdateTime = performance.now();

var hit = 0.0;
var animspd = 0;
var animtime = 0.1;
var punchanim = -0.1;
var knx = 0;
var kny = 0;

var thp = 0.0;
var jtime = 0.0;

var pslide = false;
var djump = false;
sslide.loop = true;
function checkFlag() {
    if(startgame == false) {
       window.setTimeout(checkFlag, 100); /* this checks the flag every 100 milliseconds*/
    } else {
    document.getElementById('startbutton').remove();
    lastUpdateTime = performance.now();
      setInterval(function() {
  mee.score = Math.max(0,mee.score);
  mee.hp = Math.min(mee.mxhp,mee.hp);

  if ((((jump.left&& mee.dir) || (jump.right&& !mee.dir))&&mee.yv>0.1) && !pslide){
    if (!isMobile)
    sslide.play();

  }
  if ((!(((jump.left&& mee.dir) || (jump.right&& !mee.dir))&&mee.yv>0.1))&&pslide){
    if (!isMobile)
    sslide.pause();
  }
  pslide = ((jump.left&& mee.dir) || (jump.right&& !mee.dir))&&mee.yv>0.1;
	var currentTime = performance.now();
    var dt = (currentTime - lastUpdateTime)/1000.0;
	animtime+=dt;
	punchanim-=dt;
    jtime-=dt;
	thp+= dt;

	if (thp>5.0){
	thp=0;
	mee.hp+=mee.mxhp/100.0;
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
      if (!isMobile){
      sfoot.pause();
      sfoot.currentTime = 0;
      sfoot.play();
      }
    }
		else if (mee.anim == 12)
			mee.anim = 10;

		if (mee.anim == 11){
			mee.anim = 13;
      if (!isMobile){
      sfoot.pause();
      sfoot.currentTime = 0;
      sfoot.play();
      }
    }
		else if (mee.anim == 13)
			mee.anim = 11;
		animtime = 0;
	}

	invincibility-=dt;
	if (invincibility>0){
		mee.hp = mee.mxhp;
	}
	if (mee.hp <= 0)
		{
			mee = {
				x  : 0.0,
				y  : 0.0,
				xv : 0.0,
				yv : 0.0,
				hp : 100.0,
                mxhp : 100.0,
				dir : false,
				pjs : [],//x,y,xv,yv,atk,dur,size
				score : mee.score-1,
				name : mee.name,
				anim : 0,
				char : mee.char
			};
			itemtypes[0].stk=1;
			for (var i = 1 ; i < itemtypes.length ; i++){
				itemtypes[i].stk = 0;
                for (var j = 0 ; j < itemtypes[i].upamnt ; j++)
                    itemtypes[i].upgrades[j] = false;
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
    while (itemtypes[sitm].stk<=0){
      sitm+=1;sitm%=itemtypes.length;
    }
	}
  if (itemtypes[sitm].stk<=0){
    sitm=0;
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
    if (jump.up)
        jtime = 0.2;
    if (jump.up || jump.left || jump.right)
      djump = true;
		if (keysdown.up && !keysdown.pup)
		{
      if (!isMobile && (((jump.left&& mee.dir) || (jump.right&& !mee.dir)) || jump.up || djump)){
        sjump.pause();
        sjump.currentTime = 0;
        sjump.play();
      }
			if (jtime > 0){
				mee.yv = -10;
                jtime=-0.1;
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
				}else if (djump){
            if (mee.dir)
              mee.xv = Math.max(10,mee.xv+5);
            else
              mee.xv = Math.min(-10,mee.xv-5);
            mee.yv = -10;
            djump = false;

				}

			}

		}
		if (keysdown.use)
		{
		if (cool <= 0.0){
      if (!isMobile){
        spunch.pause();
        spunch.currentTime = 0;
        spunch.play();
      }
			if (itemtypes[sitm].stk>0){
				itemtypes[sitm].func(mee);
				cool = itemtypes[sitm].cool;
				punchanim = Math.min(cool/2.0,0.5);
			}
		}
		}
		if (keysdown.right)
		{

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

		    if (jump.up){
				if (mee.xv > 0)
					mee.xv -= 2*spd*dt;
				mee.xv -= 2*spd*dt;
			}
			else
				mee.xv -= spd*dt;
		}
    if (keysdown.left && !keysdown.pleft){
        mee.dir=false;
    }
    if (keysdown.right && !keysdown.pright){
        mee.dir=true;
    }

    if (keysdown.right && keysdown.pleft && !keysdown.left){
        mee.dir=true;
    }
    if (keysdown.left && keysdown.pright && !keysdown.right){
        mee.dir=false;
    }

	keysdown.pup = keysdown.up;
	keysdown.pleft = keysdown.left;
	keysdown.pright = keysdown.right;
	keysdown.puse = keysdown.use;
	keysdown.pswitch = keysdown.switch;



    var steps = Math.floor(Math.sqrt(mee.xv*dt*mee.xv*dt+mee.yv*dt*mee.yv*dt)*8.0)+1;
    var altdt = dt/steps;
    //console.log(1.0/dt);
    for (var i = 0 ; i < triggers.length ; i++ )
	    triggers[i].cool -= dt;    
    var plrectt = {top:mee.y-0.5,bottom:mee.y+0.5,right:mee.x+0.5,left:mee.x-0.5};
    var plrectalt = {top: Math.min(plrectt.top+mee.yv*dt,plrectt.top) , bottom : Math.max(plrectt.bottom+mee.yv*dt,plrectt.bottom),left: Math.min(plrectt.left+mee.xv*dt,plrectt.left) , right : Math.max(plrectt.right+mee.xv*dt,plrectt.right) };
    var groundt = [];    
    for (var i = 0; i < ground.length; i++) {
        if (intersectRect(plrectalt,ground[i]))
            groundt.push(ground[i])
    }
    
    for (var it = 0; it < steps; it++) {
        //for (var id in cplayers) {
        //    if (id != socket.id){
        //        collidepl(mee,cplayers[id]);
        //    }
        //}
        
        var plrect = {top:mee.y-0.5,bottom:mee.y+0.5,right:mee.x+0.5,left:mee.x-0.5};
		if (Math.abs(mee.xv) > 0.001)
            mee.x += mee.xv*altdt;
        if (Math.abs(mee.yv) > 0.001)
            mee.y += mee.yv*altdt;
        
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

        
        jump = {up:false,left:false,right:false};
        for (var i = 0; i < groundt.length; i++) {
           collide(mee,groundt[i]);
	    }


        
		for (var i = 0 ; i < triggers.length ; i++ ){
			if (triggers[i].cool < 0 && intersectRect(plrect,triggers[i])){
				tfuncs[triggers[i].func](mee);
                if (triggers[i].name == " ")
                    triggers[i].cool = 0.2;
                else    
				    triggers[i].cool = 5.0;
			}
		}
		
        
	
    }
    
    //for (var id in cplayers) {
    //    if (id != socket.id){
    //        collidepl(mee,cplayers[id]);
    //    }
    //}
    

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
    }
}

checkFlag();
