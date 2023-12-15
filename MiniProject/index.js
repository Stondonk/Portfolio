const canvas = document.getElementById("GameArea");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

var DeltaTime = 0.013;

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
        camZoom += 16 * DeltaTime;}
}
function keyup(key){
    if(key.keyCode == 32){
        ActionButton = false;}
}

//player
var Player = {
    x: -48,
    y: 0,
    rot:0,

    Vx:100,
    Vy:0,

    Spr:0,
    StartSpr:0,
    LockSpr:1,

    grounded:false,
    
    TargetSpeed:14,

    JetForce:300,

    Killed:false,

    score:0,
}

var Spikes = [[-16,-8],[-48,8],[-80,-8],[-112,-16]]
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
    console.log(Wid)

    //RENDER STUFF
    var LockPoint = clamp(Player.x,0,Player.x + 64);
    if(Player.x > 0)
        DrawText(String(Player.score),0,LockPoint,FloorHeight + 2,0)
    //DrawRect(Player.x-2,Player.y-2,4,4)
    DrawSprite(16*Player.Spr,0,16,16,Player.x-8,Player.y-8,16,16, Player.rot);
    DrawRect(LockPoint-canvas.width/2,FloorHeight,canvas.width,1)
    
    for (let index = 0; index < Spikes.length; index++) {
        DrawSprite(1,45,18,18,Spikes[index][0]-8,Spikes[index][1]-8,18,18, SpikeRot);
        if(!Player.Killed){
            //Set new Spike
            if(Spikes[index][0]+8 < camX - (canvas.width/2)){
                Spikes[index][0]+=128;
                Spikes[index][1]=((parseInt(Math.random()*5)/5)*24)-8;
                Player.TargetSpeed += 0.5
            }

            if(BoxBox(Player.x - 4, Player.y - 8, Player.x + 4, Player.y + 8, Spikes[index][0]-5, Spikes[index][1]-5, Spikes[index][0]+5, Spikes[index][1]+5)){
                Player.Killed = true;Player.Vy = -100;}
        }
    }

    if(InBrows){
        //UPDATE STUFF
        if(document.getElementById("MiniCade").style.display == "none")
            InBrows = false;

        SpikeRot+=32*DeltaTime
        if(SpikeRot>360)
            SpikeRot -= 360

        //PLAYER
        const Gravity = 200
        Player.Vx = lerp(Player.Vx, Player.TargetSpeed, 2 * DeltaTime);
        camX = LockPoint
        Player.Vy += Gravity*DeltaTime

        if(!Player.Killed){
            Player.score = parseInt(Player.x/10);
            
            if(ActionButton)
                Player.Vy -= (Player.JetForce*DeltaTime)

            //Collision
            Player.grounded = false;
            if(Player.y+(Player.Vy*DeltaTime) > FloorHeight - 8){
                Player.y = FloorHeight - 8;
                Player.Vy = 0;
                Player.grounded = true;

                Player.StartSpr = 0;
                Player.LockSpr = 1;
            }else if(Player.y+(Player.Vy*DeltaTime) < -32 + 8){
                Player.y = -32 + 8;
                Player.Vy = 0;
            }else{
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
                
        }else{
            Player.Spr = 0;
            Player.rot+=100 * DeltaTime;
            if(Player.y > 128){
                //reset game
                Player.Killed = false;
                Player.x = -64;
                Player.TargetSpeed = 14;
                Player.Vx = 100;
                Player.rot = 0;

                Spikes = [[-16,-8],[-48,8],[-80,-8],[-112,-16]]
            }
        }
        

        Player.x+=parseInt(Player.Vx)*DeltaTime;
        Player.y+=Player.Vy*DeltaTime;
    }else{
        if(ActionButton)
            InBrows = true

        DrawSprite(48,48,16,16,camX - 8,camY - 8,16,16, 0);
    }
    requestAnimationFrame(Update)
}

function DrawRect(x,y,w,h){
    ctx.fillStyle = "#f2f2f2"
    ctx.fillRect(Math.round(((x - camX) * camZoom) + canvas.width/2 ),Math.round((( y - camY) * camZoom) + canvas.height/2),w * camZoom,h * camZoom);
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
