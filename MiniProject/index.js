const canvas = document.getElementById("GameArea");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const DEG2RAD = (Math.PI/180);
const RAD2DEG = (180/Math.PI);

var DeltaTime = 0.013;

var InGameTime = 0.0;
var ActTime = 0.0;

var camX = 0, camY = 0;
var camZoom = 1;

var PointOX = 0

var InBrows = false

const AtlasImage = image("MiniProject/Atlas.png");
const TextImage = image("MiniProject/Text.png");

function image(fileName) {
    const img = new Image();
    img.src = `${fileName}`;
    return img;
}

//Input
var ActionButton = false

document.body.addEventListener('keydown', keydown);
document.body.addEventListener('keyup', keyup);

document.getElementById("GameArea").addEventListener('mousedown', function(){ActionButton = true;});
document.getElementById("GameArea").addEventListener('mouseup', function(){ActionButton = false;});

document.getElementById("GameArea").addEventListener('ontouchstart', function(){ActionButton = true;});
document.getElementById("GameArea").addEventListener('ontouchend', function(){ActionButton = false;});

function keydown(key){
    if(key.keyCode == 32){
        ActionButton = true;}
    if(key.keyCode == 27){
        InBrows = false;}
        //camZoom += 16 * DeltaTime;}
}
function keyup(key){
    if(key.keyCode == 32){
        ActionButton = false;}
}

//player
var Player = {
    x: -640,
    y: 0,
    rot:0,

    w:4,
    h:12,

    Vx:100,
    Vy:0,

    Spr:0,
    StartSpr:0,
    LockSpr:1,

    grounded:false,
    
    TargetSpeed:14,

    JetForce:300,

    Killed:false,
    JK:false,

    score:0,
}

//to fix small vector dynamic array errors i split coordinates into two arrays
var spikes = [[0,0]];
var rockets = [];
var lasers = [];
//really shit feature but a game for an adaptive resoultion is fu***** annoying to make, like bro i havent slept in like 24 hours im a tired man
function StartGame(){
    spikes = [];
    rockets = [];
    lasers = [];

    console.log(document.getElementById("MiniCade").clientWidth/2)
    Player.x = -(canvas.width/2) - 8;
    Player.y = 0;
    Player.Killed = false;
    Player.TargetSpeed = 14;
    Player.Vx = 100;
    Player.Vy = 0;
    Player.rot = 0;

    camX = 0;
    camY = 0;
    for (let index = 0; index < (canvas.width / 64); index++) {
        SpawnRandomItem(index*64)
    }
    //add_rocket(32,0,315)
    //SpawnLaser()
}

//adding objects
function add_rocket(x,y,a){
    rockets.push([x,y,a]);
}
function add_laser(x,y,a,l){
    lasers.push([x,y,a,l]);
}
function add_spike(x,y){
    spikes.push([x,y]);
}

var SpikeRot = 0

var FrameTick = 0

var FloorHeight = 20;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function lerp (start, end, amt){
    return (1-amt)*start+amt*end
}

function BoxBox(x1, y1, x2, y2, x3, y3, x4, y4){
    if (x2 >= x3 && x1 <= x4 && y2 >= y3 && y1 <= y4) {
        return true;
    }
    return false;
}

function clearScreen(){
    ctx.fillStyle = "transparent";
    ctx.fillRect(0,0, canvas.width, canvas.height);
}

var Last = Date.now();
var Now = Date.now();

window.addEventListener('focus', function (event) {
    Last = Date.now();
});
window.addEventListener('blur', function (event) {
    Last = Date.now();
    InBrows = false;
    //MusicTrack.pause();
});

document.addEventListener("visibilitychange", () => {
    //if (document.hidden) {
        InBrows = false;
        Last = Date.now();
        DeltaTime = 0;
        //MusicTrack.pause();
    //}
});

function SpawnRandomItem(xOff=0,yOff=0){
    var Selection = Math.floor(Math.random()*3);
    console.log("f ",Selection)
    switch(Selection){
        case 0:
            SpawnSpike(xOff,yOff)
        break;
        case 1:
            SpawnLaser(xOff,yOff)
        break;
        case 2:
            SpawnRocket(xOff,yOff)
        break;
    }
}
function SpawnSpike(xOff=0,yOff=0){
    var SpawnHeight = 16;
    if(Math.floor(Math.random() * 2) == 1)
        SpawnHeight = -24;
    add_spike(camX + (canvas.width/2)+16+xOff,SpawnHeight+yOff);
}
function SpawnRocket(xOff=0,yOff=0){
    var SpawnHeightVarT = 4;
    var SpawnHeight = (Math.floor(Math.random() * SpawnHeightVarT))*((canvas.height-8)/SpawnHeightVarT) - (canvas.height-8)/2;
    add_rocket(camX + (canvas.width/2)+xOff,SpawnHeight+8+yOff,270+(Math.floor(Math.random()*30))-15);
}
function SpawnLaser(xOff=0,yOff=0){
    var SpawnHeightVarT = 3;
    var SpawnHeight = (Math.floor(Math.random() * SpawnHeightVarT))*((canvas.height-8)/SpawnHeightVarT) - (canvas.height-8)/2;
    add_laser(camX + (canvas.width/2) + 32+xOff,SpawnHeight+8+yOff,Math.floor(Math.random()*8)*360/8,32);
}

function Init(){
    //StartGame();
}

Init();

function Update(){
    clearScreen();

    //Delta time
    DeltaTime = ((Now - Last) / 1000);
    DeltaTime = clamp(DeltaTime, 0, 1);
    Last = Now;
    Now = Date.now();

    //UpdateStuff
    var multipler = parseFloat(document.getElementById("MiniCade").clientHeight) / parseFloat(canvas.height)
    var Wid = parseFloat(document.getElementById("MiniCade").clientWidth) / parseFloat(multipler)
    if(document.getElementById("MiniCade").clientWidth > document.getElementById("MiniCade").clientHeight)
        Wid+=(parseFloat(document.getElementById("MiniCade").clientWidth - document.getElementById("MiniCade").clientHeight) / parseFloat(document.getElementById("MiniCade").clientHeight))
    canvas.width = Wid;

    //RENDER STUFF
    var LockPoint = Math.max(0,Player.x);
    if(Player.x > 0)
        DrawText(String(Player.score),0,LockPoint,FloorHeight + 2,0)
    //DrawRect(Player.x-2,Player.y-2,4,4)
    DrawSprite(16*Player.Spr,0,16,16,Player.x-8,Player.y-8,16,16, Player.rot);
    DrawRect(LockPoint-canvas.width/2,FloorHeight,canvas.width,1)

    //RENDER OBS
    for (let Spike_Idx = 0; Spike_Idx < spikes.length; Spike_Idx++) {
        DrawSprite(2,46,16,16,spikes[Spike_Idx][0]-8,spikes[Spike_Idx][1]-8,16,16,-InGameTime*180);
    }
    for (let Rocket_Idx = 0; Rocket_Idx < rockets.length; Rocket_Idx++) {
        DrawSprite(32,16,16,16,rockets[Rocket_Idx][0]-8,rockets[Rocket_Idx][1]-8,16,16,rockets[Rocket_Idx][2]);
    }
    //Update Lasers
    for (let Laser_Idx = 0; Laser_Idx < lasers.length; Laser_Idx++) {
        var ax = Math.sin(lasers[Laser_Idx][2]*DEG2RAD) ;
        var ay = -Math.cos(lasers[Laser_Idx][2]*DEG2RAD) ;
        var rax = Math.cos(lasers[Laser_Idx][2]*DEG2RAD) ;
        var ray = Math.sin(lasers[Laser_Idx][2]*DEG2RAD) ;
        DrawSprite(1,17,14,14,lasers[Laser_Idx][0]+(ax*lasers[Laser_Idx][3]/2)-8,lasers[Laser_Idx][1]+(ay*lasers[Laser_Idx][3]/2)-8,14,14,lasers[Laser_Idx][2]-180);
        DrawSprite(1,17,14,14,lasers[Laser_Idx][0]-(ax*lasers[Laser_Idx][3]/2)-8,lasers[Laser_Idx][1]-(ay*lasers[Laser_Idx][3]/2)-8,14,14,lasers[Laser_Idx][2]);
        var Wire_Length = 12;
        var Wire_Dist = 12;
        for (let Lp = 0; Lp < Wire_Length; Lp++) {
            var sinT = (Math.sin((InGameTime * 10.0) + Lp/2.0) * Wire_Dist)*(Math.sin((Lp/Wire_Length*2)*(Math.PI*0.5))/Math.PI);
            var StrAx = lasers[Laser_Idx][0]-(ax*lasers[Laser_Idx][3]/2) + (ax*lasers[Laser_Idx][3]/Wire_Length)*Lp;
            var StrAy = lasers[Laser_Idx][1]-(ay*lasers[Laser_Idx][3]/2) + (ay*lasers[Laser_Idx][3]/Wire_Length)*Lp;
            //DrawCircle(StrAx+(rax*sinT),StrAy+(ray*sinT),4);
            DrawRect(StrAx+(rax*sinT)-2,StrAy+(ray*sinT)-2,2,2)
            //DrawLine(StrAx+(rax*sinT),StrAy+(ray*sinT),StrAx+(rax*sinT) + (rax*4),StrAy+(ray*sinT)+ (ray*4))
        }
    }

    if(InBrows){
        //UPDATE STUFF
        InGameTime += DeltaTime;
        ActTime += DeltaTime;

        if(document.getElementById("MiniCade").style.display == "none")
            InBrows = false;

        SpikeRot+=32*DeltaTime
        if(SpikeRot>360)
            SpikeRot -= 360

        //Obsticles
        //Update Spike
        var Spike_Remove = []

        for (let Spike_Idx = 0; Spike_Idx < spikes.length; Spike_Idx++) {
            //lasers[Laser_Idx][2]+=32*DeltaTime;
            spikes[Spike_Idx][0] -= 30*DeltaTime;

            if(spikes[Spike_Idx][0] < camX - (canvas.width/2) - 16){
                SpawnRandomItem();
                Spike_Remove.push(Spike_Idx)
            }

            if(BoxBox(Player.x-Player.w/2,Player.y-Player.h/2,Player.x+Player.w/2,Player.y+Player.h/2,spikes[Spike_Idx][0]-4,spikes[Spike_Idx][1]-4,spikes[Spike_Idx][0]+4,spikes[Spike_Idx][1]+4)){
                Player.Killed = true;
            }

        }
        for (let LR = 0; LR < Spike_Remove.length; LR++) {
            spikes.splice(Spike_Remove[LR],1);
        }

        //Update Rockets
        var Rocket_Remove = []

        const RocketSpeed = 20;
        for (let Rocket_Idx = 0; Rocket_Idx < rockets.length; Rocket_Idx++) {
            var ax = Math.sin(rockets[Rocket_Idx][2]*DEG2RAD) * RocketSpeed;
            var ay = -Math.cos(rockets[Rocket_Idx][2]*DEG2RAD) * RocketSpeed;
            rockets[Rocket_Idx][0]+=ax*DeltaTime;
            rockets[Rocket_Idx][1]+=ay*DeltaTime;

            if(rockets[Rocket_Idx][0] < camX - (canvas.width/2) - 16){
                SpawnRandomItem();
                Rocket_Remove.push(Rocket_Idx)
            }

            if(BoxBox(Player.x-Player.w/2,Player.y-Player.h/2,Player.x+Player.w/2,Player.y+Player.h/2,rockets[Rocket_Idx][0]-4,rockets[Rocket_Idx][1]-4,rockets[Rocket_Idx][0]+4,rockets[Rocket_Idx][1]+4)){
                Player.Killed = true;
            }
        }
        for (let LR = 0; LR < Rocket_Remove.length; LR++) {
            rockets.splice(Rocket_Remove[LR],1);
        }
        //Update Lasers
        var Laser_Remove = []

        for (let Laser_Idx = 0; Laser_Idx < lasers.length; Laser_Idx++) {
            //lasers[Laser_Idx][2]+=32*DeltaTime;
            if(lasers[Laser_Idx][0] < camX - (canvas.width/2) - lasers[Laser_Idx][3]){
                SpawnRandomItem();
                Laser_Remove.push(Laser_Idx)
            }

            //Multi point collision check (was too lazy and also didnt really need to add proper line box collision)

            var ax = Math.sin(lasers[Laser_Idx][2]*DEG2RAD) ;
            var ay = -Math.cos(lasers[Laser_Idx][2]*DEG2RAD) ;

            const PointCheck = 4;
            const PointDist = 16;
            var Sx = lasers[Laser_Idx][0]-ax*(PointDist/2);
            var Sy = lasers[Laser_Idx][1]-ay*(PointDist/2);

            for (let Pdex = 0; Pdex < PointCheck; Pdex++) {
                var CheckPx = Sx+(ax*((PointDist/(PointCheck-1))*Pdex));
                var CheckPy = Sy+(ay*((PointDist/(PointCheck-1))*Pdex));
                if(BoxBox(Player.x-Player.w/2,Player.y-Player.h/2,Player.x+Player.w/2,Player.y+Player.h/2,CheckPx-1,CheckPy-1,CheckPx+1,CheckPy+1)){
                    Player.Killed = true;
                }
                DrawRect(CheckPx,CheckPy,1,1)
            }

        }
        for (let LR = 0; LR < Laser_Remove.length; LR++) {
            lasers.splice(Laser_Remove[LR],1);
        }

        //PLAYER
        const Gravity = 200
        Player.Vx = lerp(Player.Vx, Player.TargetSpeed, 2 * DeltaTime);
        camX = LockPoint
        Player.Vy += Gravity*DeltaTime

        if(!Player.Killed){
            Player.JK = false;
            Player.score = parseInt(Player.x/10);
            
            if(ActionButton){
                if(Player.grounded)
                    Player.Vy = -8;
                Player.Vy -= (Player.JetForce*DeltaTime)
            }

            //Collision
            if(Player.y+(Player.Vy*DeltaTime) > FloorHeight - 8){
                Player.y = FloorHeight - 8;
                Player.Vy = 0;
                if(!Player.grounded)
                    camZoom = 1.125;
                Player.grounded = true;

                Player.StartSpr = 0;
                Player.LockSpr = 1;
            }else if(Player.y+(Player.Vy*DeltaTime) < -32 + 8){
                Player.grounded = false;
                Player.y = -32 + 8;
                Player.Vy = 0;
            }else{
                Player.grounded = false;
                Player.StartSpr = 2;
                Player.LockSpr = 1;
            }

            
            if(FrameTick > 0.25){
                Player.Spr+=1
                if(Player.Spr > Player.LockSpr + Player.StartSpr)
                    Player.Spr = Player.StartSpr;
                FrameTick = 0;
            }else
                FrameTick += DeltaTime;

            Player.TargetSpeed = clamp(14+(Player.x/100),14,640);
                
        }else{
            if(!Player.JK){
                Player.Vy = -100;
            }
            Player.JK = true;
            Player.Spr = 0;
            Player.rot+=100 * DeltaTime;
            if(Player.y > 128){
                //reset game
                StartGame();
            }
        }

        camZoom = lerp(camZoom,1,6*DeltaTime);
        

        Player.x+=parseInt(Player.Vx)*DeltaTime;
        Player.y+=Player.Vy*DeltaTime;
    }else{
        if(ActionButton){
            if (ActTime <= 0)
                StartGame()
            InBrows = true
        }

        DrawSprite(48,48,16,16,camX - 8,camY - 8,16,16, 0);
    }
    requestAnimationFrame(Update)
}

function DrawRect(x,y,w,h){
    ctx.fillStyle = "#f2f2f2"
    ctx.fillRect(Math.round(((x - camX) * camZoom) + canvas.width/2 ),Math.round((( y - camY) * camZoom) + canvas.height/2),w * camZoom,h * camZoom);
}
function DrawCircle(x,y,r){
    ctx.fillStyle = "#f2f2f2"
    ctx.beginPath();
    ctx.strokeStyle = "#f2f2f2";
    ctx.arc(Math.round(((x - camX) * camZoom) + canvas.width/2 ), Math.round((( y - camY) * camZoom) + canvas.height/2), r, 0, 2 * Math.PI);
    ctx.stroke();
    //ctx.fill();
}
function DrawLine(x1,y1,x2,y2,w=1.0){
    ctx.strokeStyle = "#f2f2f2";
    ctx.globalalpha = 1.0
    ctx.lineWidth = w;
    ctx.beginPath();
    var Vet1 = {
        x: Math.round(((x1 - camX) * camZoom) + canvas.width/2 ),
        y: Math.round(((y1 - camY) * camZoom) + canvas.height/2 )
    }
    var Vet2 = {
        x: Math.round(((x2 - camX) * camZoom) + canvas.width/2 ),
        y: Math.round(((y2 - camY) * camZoom) + canvas.height/2 )
    }
    ctx.stroke();
}

function DrawSprite(Sx, Sy, Sw, Sh, x, y, w, h, degrees){
    const Spr = {
        W: w*camZoom,
        H: h*camZoom,
        X: Math.round(((x - camX) * camZoom) + canvas.width/2 ),
        Y: Math.round((( y - camY) * camZoom) + canvas.height/2)
    }
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate( Spr.X+Spr.W/2, Spr.Y+Spr.H/2);
    ctx.rotate(Math.round(degrees)*(Math.PI/180.0));
    ctx.translate(-Spr.X-Spr.W/2, -Spr.Y-Spr.H/2);
    ctx.drawImage(AtlasImage,Sx, Sy, Sw, Sh, Spr.X, Spr.Y, Spr.W, Spr.H);
    //ctx.drawImage(AtlasImage,Sx, Sy, Sw, Sh, Math.round(((x-camX)*camZoom) + canvas.width/2), Math.round(((y-camY)*camZoom) + canvas.height/2), (w*camZoom)+0.1, (h*camZoom)+0.1);
    ctx.restore();
}

function DrawChar(C, x,y,w,h,degrees){
    const Spr = {
        W: w*camZoom,
        H: h*camZoom,
        X: Math.round(((x - camX) * camZoom) + canvas.width/2 ),
        Y: Math.round((( y - camY) * camZoom) + canvas.height/2)
    }
    const CharIntLocal = ((Number(C.charCodeAt(0)) - 48));
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate( Spr.X+Spr.W/2, Spr.Y+Spr.H/2);
    ctx.rotate(Math.round(degrees)*(Math.PI/180.0));
    ctx.translate(-Spr.X-Spr.W/2, -Spr.Y-Spr.H/2);
    ctx.drawImage(TextImage,CharIntLocal*8, 0, 8, 8, Spr.X, Spr.Y, Spr.W, Spr.H);
}

function DrawText(TextRef,Side,x,y,rot){
    var Centre = ((Side + 1) / 2) * (TextRef.length * 8);
    var EndCap = 0;
    for (let r = 0; r < TextRef.length; r++) {
        const element = TextRef[r];
        DrawChar(element, x + r * 8 - Centre, y, 8,8, rot);
    }
}

Update();
