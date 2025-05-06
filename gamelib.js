let mouse = {x:0,y:0,leftButton:0,rightButton:2,centerButton:1,leftClick:false,leftClickable:true,visible:true};
let key = {pressed:{},space:32,enter:13,left:37,up:38,right:39,down:40};
//Font Object
class Font{
  constructor(size = "18pt",family = "Arial" ,color = "black" ,shadow = null){
    this.size = size
    this.family = family
    this.color = color
    this.shadow = shadow
  }
}
//Sound Object
class Sound{
  constructor(audio){
    this.audio = audio;
  }
  play(){
    this.audio.play();
  }

}

class Keys{
  constructor(){
    this.ESCAPE = 27;
    this.LEFTARRROW = 37;
    this.RIGHTARROW = 39;
    this.UPARROW = 37;
    this.BOTTOMARRROW = 40;
    this.W = 87;
    this.A = 65;
    this.S = 83;
    this.D = 68;
    this.ENTER = 13;
    this.SPACE = 32;
  }
}

let processMouseButton = (button,bool) =>{
  switch(button){
    case 0:
      mouse.leftButton = bool;break;
    case 1:
      mouse.centerButton = bool;break;
    case 0:
      mouse.rightButton = bool;break;
  } 
}
let processMouseMove = (source,rect) =>{
  mouse.x = source.clientX - rect.left;
  mouse.y = source.clientY - rect.top;
  mouse.left = mouse.x;
  mouse.right = mouse.x;
  mouse.top = mouse.y;
  mouse.bottom = mouse.y;
  //Update for touch?
}
class Game{
  constructor(canvas){
    this.canvas = document.getElementById(canvas);
    this.canvas.tabIndex = 1;
    this.canvas.oncontextmenu = function(e) {return false;}  //Override context menu
    this.canvas.addEventListener('mousedown', function(e) { processMouseButton(e.button,true) },false);
    this.canvas.addEventListener('mouseup', function(e) { processMouseButton(e.button,false) },false);
    this.canvas.addEventListener('mousemove', function(e) { processMouseMove(e, this.getBoundingClientRect()) },false);
    this.canvas.addEventListener("touchstart", function (e) { processMouseMove(e.touches[0], this.getBoundingClientRect()) },false);
    this.canvas.addEventListener("touchmove", function (e) { processMouseMove(e.touches[0], this.getBoundingClientRect()) },false);
    window.addEventListener('keydown', function(e) { key.pressed[e.keyCode]=true; },false);
    window.addEventListener('keyup', function(e) { key.pressed[e.keyCode]=false; },false);
    this.context = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.left = 0;
    this.right = this.width;
    this.top = 0;
    this.bottom = this.height;
    this.over = false;
    this.pause = false;
    this.ready = false;
    this.state = null;
    this.score = 0;
    this.fps = 50;
    this.pace = 1000/this.fps;
    this.showBoundingBoxes = false;
    this.images = {};
    this.audios = {};
  }

  processInput(){
    if(mouse.leftClickable && mouse.leftButton){
      mouse.leftClick = true
      mouse.leftClickable = false
    }
    if(! mouse.leftClickable && !mouse.leftButton){
      mouse.leftClickable = true
    }
  }
  update(){
      this.t -= 1.0 / this.fps;
      mouse.leftClick = false;
  }
  preload(sources){
    var ct = 0;
    this.time = 0;
    for(let i = 65; i <= 90; i++){
      key[String.fromCharCode(i)] = i;
    }
    console.log("Preloading");
    for(let i = 0; i < sources.images.length; i++) {
        this.images[sources.images[i].id] = new Image();
        this.images[sources.images[i].id].onload = () => {
            if(++ct >= sources.images.length + sources.audios.length) {
                this.ready = true;
            }
        }
        this.images[sources.images[i].id].src = sources.images[i].src;
    }
    for(let i = 0; i < sources.audios.length; i++) {
        this.audios[sources.audios[i].id] = new Audio();
        this.audios[sources.audios[i].id].oncanplaythrough = () =>  {
            if(++ct >= sources.images.length + sources.audios.length) {
                this.ready = true;
            }
        }
        this.audios[sources.audios[i].id].src = sources.audios[i].src;
        this.audios[sources.audios[i].id].load();
    }
  }
  drawText(msg,x,y,font = new Font()){
    this.context.font = font.size + " " + font.family;
    if(font.shadow){
      this.context.fillStyle = font.shadow
      this.context.fillText(msg, x + 2, y + 2);
    }
    this.context.fillStyle = font.color;
    this.context.fillText(msg, x, y);
  }
  setBackground(bkGraphics){
    this.background = bkGraphics;
    this.backgroundXY = [[],[],[]]
    for(let r = 0; r < 3; r++){
      for(let c = 0; c < 3; c++){
        this.backgroundXY[r].push({"x":this.width * (c-1) + this.width / 2,"y":this.height * (r-1) + this.height / 2})
      }
    }
  }
  drawBackground(){
    if(this.background){
      this.background.draw();
    }else{
      this.clearBackground("black");
    }
  }
  clearBackground(color){
    let c = (color == undefined)?"white":color;
    this.context.fillStyle = c;
    this.context.fillRect(0,0,this.width,this.height);
  }
  scrollBackground(direction,amt = 2){
    if(direction == "left")
      for(let r = 0; r < 3; r++)
        for(let c = 0; c < 3; c++){
          this.backgroundXY[r][c]["x"] -= amt
          if(this.backgroundXY[r][c]["x"] + this.background.width  / 2 <= 0)
              this.backgroundXY[r][c]["x"] = this.backgroundXY[r][(c+2)%3]["x"] + this.background.width - amt
          this.background.moveTo(this.backgroundXY[r][c]["x"],this.backgroundXY[r][c]["y"])
        }
    else if(direction == "right")
      for(let r = 0; r < 3; r++)
        for(let c = 2; c >= 0; c--){
          this.backgroundXY[r][c]["x"] += amt
          if(this.backgroundXY[r][c]["x"] - this.background.width  / 2 >= this.width)
              this.backgroundXY[r][c]["x"] = this.backgroundXY[r][(c-2)%3]["x"] - this.background.width + amt
          this.background.moveTo(this.backgroundXY[r][c]["x"],this.backgroundXY[r][c]["y"])
        }
    else if(direction == "up")
      for(let c = 0; c < 3; c++)
        for(let r = 0; r < 3; r++){
          this.backgroundXY[r][c]["y"] -= amt
          if(this.backgroundXY[r][c]["y"] + this.background.height  / 2 <= 0)
              this.backgroundXY[r][c]["y"] = this.backgroundXY[(r+2)%3][c]["y"] + this.background.height - amt
          this.background.moveTo(this.backgroundXY[r][c]["x"],this.backgroundXY[r][c]["y"])
        }
    else if(direction == "down")
      for(let c = 0; c < 3; c++)
        for(let r = 2; r >= 0; r--){
          this.backgroundXY[r][c]["y"] += amt
          if(this.backgroundXY[r][c]["y"] - this.background.height  / 2 >= this.height)
              this.backgroundXY[r][c]["y"] = this.backgroundXY[(r-2)%3][c]["y"] - this.background.height + amt
          this.background.moveTo(this.backgroundXY[r][c]["x"],this.backgroundXY[r][c]["y"])
        }
    else if(direction == "still")
      for(let r = 0; r < 3; r++)
        for(let c = 0; c < 3; c++)   
          this.background.moveTo(this.backgroundXY[r][c]["x"],this.backgroundXY[r][c]["y"])
  }

}
Object.defineProperty(Game.prototype, "time", {
    get: function() {               
      return Math.floor(this.t);
    },
    set: function(t) {
          this.t = t;
    },
        
    configurable: false
});
  ///////////////////////////////////////Custom

class Cell{
  constructor(x,y,type,state){
    this.x = x;
    this.y = y;
    this.type = type;
    this.state = state;
  }
}

class Player{
  constructor(x,y,facing){
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.canmove = true;
  }
  Move(x,y){
    this.x += x;
    this.y += y;
  }
  Changefacing(facingDir){
    if (facingDir == 1){
      //Add, Right, +
      if (this.facing == 4){
        this.facing = 1;
      } else {
        this.facing += 1;
      }
    } else if (facingDir == 2){
      //Sub, left, -
      if (this.facing == 1){
        this.facing = 4;
      } else {
        this.facing -= 1;
      }
    }
  }
}

class Level{
  constructor(name,id,Level){
    this.name = name;
    this.id = id;
    this.StageData = Level;
  }
}

class GameJamming{
  constructor(){
    this.Grid = [];
    this.GridX = 10;
    this.GridY = 10;
    this.CurrentPlayer = new Player(2,2,2);
    this.CurrentLevel = 1;
    this.LevelDataLevel = 0;
    this.HighestLevel = 1;
    //
    this.MaxMoves = 10;
    this.Moves = 0;
    this.LevelDataStorage = [
      {
        "ID": 1, //Position Of Level
        "GridSize": [10,10], //[xsize,ysize] The GridSize keep at 10,10 im too lazy
        "Moves": 5, //How Many Moves
        "WinBlock": [7,6],
        "StartingPlayerPosition": [4,6],
        "PushBlocks": [],
        "BorderBlocks": [ //[x,y]  The Border Blocks Spawn
          [2,1],
          [2,2],
          [2,3],
          [2,4],
          [2,5],
          [2,6],
          [2,7],
          [2,8],
          [2,9],
          [2,10],
          [1,4],
          [4,4],
          [5,4],
          [6,4],
          [7,4],
          [1,3],
          [4,3],
          [5,3],
          [6,3],
          [7,3],
          [1,2],
          [4,2],
          [5,2],
          [6,2],
          [7,2],
          [1,8],
          [4,8],
          [5,8],
          [6,8],
          [7,8],
          [1,9],
          [4,9],
          [5,9],
          [6,9],
          [7,9],
          [1,4],
          [4,4],
          [5,8],
          [6,8],
          [7,8],
          [3,1],
          [3,2],
          [3,3],
          [3,4],
          [3,5],
          [3,6],
          [3,7],
          [3,8],
          [3,9],
          [3,10],
          [9,1],
          [9,2],
          [9,3],
          [9,4],
          [9,5],
          [9,6],
          [9,7],
          [9,8],
          [9,9],
          [9,10],
          [8,1],
          [8,2],
          [8,3],
          [8,4],
          [8,5],
          [8,6],
          [8,7],
          [8,8],
          [8,9],
          [8,10],
        ],
        "DeleteBlocks": [],
        "BeatBlocksA": [],
        "BeatBlocksB": [],
      },
      {
        "ID": 2, //Position Of Level
        "GridSize": [10,10], //[xsize,ysize] The GridSize keep at 10,10 im too lazy
        "Moves": 12, //How Many Moves
        "WinBlock": [7,3],
        "StartingPlayerPosition": [3,3],
        "PushBlocks": [],
        "BorderBlocks": [ //[x,y]  The Border Blocks Spawn
          [2,1],
          [2,2],
          [2,3],
          [2,4],
          [2,5],
          [2,6],
          [2,7],
          [2,8],
          [2,9],
          [2,10],
          [1,4],
          [4,4],
          [6,4],
          [7,4],
          [1,3],
          [4,3],
          [4,5],
          [4,6],
          [6,6],
          [6,5],
          [6,7],
          [7,5],
          [7,6],
          [7,7],
          [1,2],
          [4,2],
          [5,2],
          [6,2],
          [7,2],
          [1,8],
          [4,8],
          [5,8],
          [6,8],
          [7,8],
          [1,9],
          [4,9],
          [5,9],
          [6,9],
          [7,9],
          [1,4],
          [4,4],
          [5,8],
          [6,8],
          [7,8],
          [3,1],
          [3,2],
          [3,8],
          [3,9],
          [3,10],
          [9,1],
          [9,2],
          [9,3],
          [9,4],
          [9,5],
          [9,6],
          [9,7],
          [9,8],
          [9,9],
          [9,10],
          [8,1],
          [8,2],
          [8,3],
          [8,4],
          [8,5],
          [8,6],
          [8,7],
          [8,8],
          [8,9],
          [8,10],
        ],
        "DeleteBlocks": [],
        "BeatBlocksA": [],
        "BeatBlocksB": [],
      },
      {
        "ID": 3, //Position Of Level
        "GridSize": [10,10], //[xsize,ysize] The GridSize keep at 10,10 im too lazy
        "Moves": 16, //How Many Moves
        "WinBlock": [9,9],
        "StartingPlayerPosition": [2,2],
        "PushBlocks": [
          [4,3],
        ],
        "BorderBlocks": [ //[x,y]  The Border Blocks Spawn
          [2,8],
          [2,9],
          [2,10],
          [1,4],
          [4,4],
          [7,4],
          [1,3],
          [4,5],
          [4,6],
          [6,2],
          [5,6],
          [6,4],
          [7,5],
          [7,6],
          [7,7],
          [1,2],
          [4,2],
          [5,2],
          [6,2],
          [1,8],
          [4,8],
          [5,8],
          [6,8],
          [7,8],
          [1,9],
          [4,9],
          [5,9],
          [6,9],
          [7,9],
          [7,8],
          [3,1],
          [3,2],
          [3,8],
          [3,9],
          [3,10],
          [9,1],
          [9,3],
          [9,4],
          [2,4],
          [2,5],
          [2,6],
          [8,1],
          [8,7],
          [8,8],
          [8,9],
          [8,10],
        ],
        "DeleteBlocks": [],
        "BeatBlocksA": [],
        "BeatBlocksB": [],
      },
      {
        "ID": 4, //Position Of Level
        "GridSize": [10,10], //[xsize,ysize] The GridSize keep at 10,10 im too lazy
        "Moves": 14, //How Many Moves
        "WinBlock": [9,9],
        "StartingPlayerPosition": [2,2],
        "PushBlocks": [
          [2,3],
          [2,4],
          [2,5],
          [2,6],
          [2,7],
          [2,8],
          //////
          [3,3],
          [3,4],
          [3,5],
          [3,6],
          [3,7],
          [3,8],
          //////
          [3,2],
          [4,2],
          [5,2],
          [6,2],
          [7,2],
          [8,2],
          [9,2],
          /////////
          [3,3],
          [4,3],
          [5,3],
          [6,3],
          [7,3],
          [8,3],
          /////
          [3,4],
          [4,4],
          [5,4],
          [6,4],
          [7,4],
          [8,4],
          /////
          [3,5],
          [4,5],
          [5,5],
          [6,5],
          [7,5],
          [8,5],
          /////
          [3,6],
          [4,6],
          [5,6],
          [6,6],
          [7,6],
          [8,6],
          /////
          [3,7],
          [4,7],
          [5,7],
          [6,7],
          [7,7],
          [8,7],
          /////
          [3,8],
          [4,8],
          [5,8],
          [6,8],
          [7,8],
          [8,8],
        ],
        "BorderBlocks": [ //[x,y]  The Border Blocks Spawn
          
        ],
        "DeleteBlocks": [],
        "BeatBlocksA": [],
        "BeatBlocksB": [],
      },
      {
        "ID": 5, //Position Of Level
        "GridSize": [10,10], //[xsize,ysize] The GridSize keep at 10,10 im too lazy
        "Moves": 20, //How Many Moves
        "WinBlock": [9,9],
        "StartingPlayerPosition": [2,4],
        "PushBlocks": [
          [4,4],
          [5,4],
          [6,4],
          ////
          [8,5],
          [8,7],
          [5,6],
        ],
        "BorderBlocks": [ //[x,y]  The Border Blocks Spawn
          [2,2],
          [3,2],
          [4,2],
          [5,2],
          [6,2],
          [6,6],
          [7,6],
          [8,6],
          /////
          [2,3],
          [3,3],
          [4,3],
          [5,3],
          [8,3],
          [8,8],
          [8,9],
          [2,8],
          [3,8],
          [4,8],
          [5,8],
          [6,8],
          [7,8],
          //
          [2,9],
          [3,9],
          [4,9],
          [5,9],
          [6,9],
          [7,9],
          //
          [8,4],
          ///
          [2,5],
          [2,6],
          [7,3],
          [3,5],
          ///
          [2,7],
          [4,6],
          [6,3],
          [3,6],
        ],
        "DeleteBlocks": [
          [7,3],
        ],
        "BeatBlocksA": [],
        "BeatBlocksB": [],
      },
      {
        "ID": 6, //Position Of Level
        "GridSize": [10,10], //[xsize,ysize] The GridSize keep at 10,10 im too lazy
        "Moves": 23, //How Many Moves
        "WinBlock": [5,6],
        "StartingPlayerPosition": [4,4],
        "PushBlocks": [
          [2,6],
          [3,8],
          [5,9],
          [5,3],
          [7,6],
          [7,5],
          [7,4],
          [7,3],
          [7,7],
        ],
        "BorderBlocks": [ //[x,y]  The Border Blocks Spawn
          [6,6],
          [8,3],
          [8,2],
          [2,2],
          [2,3],
          [2,4],
          [3,2],
          [3,3],
          [3,4],
          [4,3],
          [4,2],
          [6,4],
          [6,3],
          [9,4],
          [9,5],
          [9,6],
          [9,7],
          [9,8],
          [9,9],
          [9,3],
          [9,2],
          [9,1],
          [8,4],
          [8,5],
          [8,6],
          [8,7],
          [8,8],
          [8,9],
          [7,9],
          [5,7],
          [5,5],
          [6,5],
          [6,6],
          [6,7],
          [4,7],
          [4,5],
          [2,4],
          [4,5],
          [3,5],
          [3,7],
          [2,9],
          [3,9],
          [5,8],
        ],
        "DeleteBlocks": [
          [2,5],
          [2,8],
          [5,2],
          [7,8],
          [4,9],
        ],
        "BeatBlocksA": [],
        "BeatBlocksB": [],
      },
      {
        "ID": 7, //Position Of Level
        "GridSize": [10,10], //[xsize,ysize] The GridSize keep at 10,10 im too lazy
        "Moves": 19, //How Many Moves
        "WinBlock": [5,9],
        "StartingPlayerPosition": [5,2],
        "PushBlocks": [
          [6,3],
          [4,4],
          [6,5],
          [4,6],
          [6,7],
          [4,8],
        ],
        "BorderBlocks": [ //[x,y]  The Border Blocks Spawn
          [4,2],
          [6,2],
          [2,2],
          [2,3],
          [2,4],
          [2,5],
          [2,6],
          [2,7],
          [2,8],
          [2,9],
          //
          //
          ////
          [8,2],
          [8,3],
          [8,4],
          [8,5],
          [8,6],
          [8,7],
          [8,8],
          [8,9],
          //
          [9,2],
          [9,3],
          [9,4],
          [9,5],
          [9,6],
          [9,7],
          [9,8],
          [9,9],

          //
          [7,2],
          [3,3],
          [7,4],
          [3,5],
          [7,6],
          [3,7],
          [7,8],
          [3,9],
          [7,9],
          [3,2],
          [4,3],
          //
          
          [6,9],
        ],
        "DeleteBlocks": [
          [7,3],
          [3,4],
          [7,5],
          [3,6],
          [7,7],
          [3,8],
        ],
        "BeatBlocksA": [
          [5,3],
          [5,5],
          [5,7],
        ],
        "BeatBlocksB": [
          [5,4],
          [5,6],
          [5,8],
        ],
      },
    ];
    this.State = "Menu";
    this.BeatBlockState = true;
    // "menu" = Main Menu
    // "Selection" = Select level
    // "Start" = Playing
    // "Pause" = Paused"
    this.CountDownPlayerMoveTimer = 0;
    this.CountDown = false;
    this.LevelSelectGrid = [];
    //
    this.StartFont = new Font("33px","Impact","White","Black");
    this.LevelSelectionFont = new Font("20px","Lucida","Red","Black");
    this.MovesFont = new Font("25px","Lucida","Orange","Black");
  }
  CheckForKeys(Key){
    if (Key.pressed[Keys.W] == true) {
      return Keys.W;
    } else if (Key.pressed[Keys.A] == true) {
      return Keys.A;
    } else if (Key.pressed[Keys.S] == true) {
      return Keys.S;
    } else if (Key.pressed[Keys.D] == true) {
      return Keys.D;
    } else {
      return false;
    }
  }
  CheckMoves(){
    console.log("over mooved");
    if (this.Moves >= this.MaxMoves) {
      this.LoadLevel(this.LevelDataLevel); 
    }
  }
  MoveChecks(Key,KeysCheck,x,y){
    if (KeysCheck == false) {
      return false;
    }
    if (Key.pressed[KeysCheck] && this.CurrentPlayer.canmove == true){
      if (this.Grid[this.CurrentPlayer.x+x][this.CurrentPlayer.y+y].State == 1) {
        
      } else if (this.Grid[this.CurrentPlayer.x+x][this.CurrentPlayer.y+y].State == 3) {
        let MovableBlock = this.Grid[this.CurrentPlayer.x+x][this.CurrentPlayer.y+y];
        
        let CheckedBlock = this.Grid[this.CurrentPlayer.x+(2*x)][this.CurrentPlayer.y+(2*y)];
        if (CheckedBlock.State == 1) {
          return false;
        } else if (CheckedBlock.State == 2) {
          CheckedBlock.State = 3;
          MovableBlock.State = 2;
          this.CurrentPlayer.Move(x,y);
          if (this.BeatBlockState == true) {
            this.BeatBlockState = false;
          } else if (this.BeatBlockState == false) {
            this.BeatBlockState = true;
          }
          this.Moves += 1;
          this.CheckMoves();
          this.CurrentPlayer.canmove = false;
          this.CountDown = true;
        } else if (CheckedBlock.State == 3) {
          let Repeater = true;
          let Counter = 2;
          while (Repeater == true) {
            Counter += 1;
            let CheckedBlock2 = this.Grid[this.CurrentPlayer.x+(Counter*x)][this.CurrentPlayer.y+(Counter*y)];

            if (CheckedBlock2.State == 3) {
            } else if (CheckedBlock2.State == 1) {
              return false;
            } else if (CheckedBlock2.State == 5){
              console.log("detected and deleted");
              CheckedBlock2.State = 5;
              MovableBlock.State = 2;
              this.CurrentPlayer.Move(x,y);
              this.Moves += 1;
              this.CheckMoves();
              this.CurrentPlayer.canmove = false;
              this.CountDown = true;
              
              return false;
            } else {

              Counter -= 1;
              CheckedBlock2.State = 3;
              let CheckedBlock3 = this.Grid[this.CurrentPlayer.x+(Counter*x)][this.CurrentPlayer.y+(Counter*y)];
              if (CheckedBlock3.State == 1) {
                return false;
              }
              MovableBlock.State = 2;
              Repeater = false;
              console.log(Counter);
            }
          }
          
        } else if (CheckedBlock.State == 5) {
          if (this.BeatBlockState == true) {
            this.BeatBlockState = false;
          } else if (this.BeatBlockState == false) {
            this.BeatBlockState = true;
          }
          CheckedBlock.State = 5;
          MovableBlock.State = 2;
          this.CurrentPlayer.Move(x,y);
          this.Moves += 1;
          this.CheckMoves();
          this.CurrentPlayer.canmove = false;
          this.CountDown = true;
        }
      } else if (this.Grid[this.CurrentPlayer.x+x][this.CurrentPlayer.y+y].State == 4) {
        this.CurrentPlayer.canmove = false;
        this.CountDown = true;
        this.CurrentLevel += 1;
        this.LevelDataLevel += 1;
        if (this.LevelDataLevel >= this.HighestLevel) {
          this.HighestLevel = this.LevelDataLevel;
        }
        this.LoadLevel(this.LevelDataLevel);   
        console.log(this.CurrentLevel)
      } else if (this.Grid[this.CurrentPlayer.x+x][this.CurrentPlayer.y+y].State == 5){
        this.CurrentPlayer.Move(x,y);
        this.Moves += 1;
        this.CheckMoves();
        this.CurrentPlayer.canmove = false;
        this.CountDown = true;
      } else if (this.Grid[this.CurrentPlayer.x+x][this.CurrentPlayer.y+y].State == 6){
        if (this.BeatBlockState == false) {
          return false;
        } else {
          this.CurrentPlayer.Move(x,y);
          this.Moves += 1;
          this.CheckMoves();
          this.CurrentPlayer.canmove = false;
          this.CountDown = true;
        }
        } else if (this.Grid[this.CurrentPlayer.x+x][this.CurrentPlayer.y+y].State == 7){
        if (this.BeatBlockState == true) {
          return false;
        } else {
          this.CurrentPlayer.Move(x,y);
          this.Moves += 1;
          this.CheckMoves();
          this.CurrentPlayer.canmove = false;
          this.CountDown = true;
        }
      } else {
        this.CurrentPlayer.Move(x,y);
        this.Moves += 1;
        this.CheckMoves();
        this.CurrentPlayer.canmove = false;
        this.CountDown = true;
      }
    }
  }
  ReturnStateKey(){
    return key;
  }
  ReturnStateMouse(){
    return mouse;
  }
  ChangeGameState(State){
    this.State = State;
  }
  ChangeMetaData(Level,NewPlayer){
    this.CurrentLevel = Level;
    this.CurrentPlayer = NewPlayer;
  }
  GenerateGrid(){
    this.Grid = [];
    for(let x = 1; x <= this.GridX; x++){
      this.Grid[x] = [];
      for(let y = 1; y <= this.GridY; y++){
        this.Grid[x][y] = [];
        this.Grid[x][y].State = 2;
        if (x == 1 || y == 1 || x == this.GridX || y == this.GridY){
          this.Grid[x][y].State = 1;
        }
      }
    }
  }
  DisplayGrid(Border,Blank,Block,Win,PlayerIMG,Delete,BeatA,BeatB,BeatAT,BeatBT){
    for(let x = 1; x <= this.GridX; x++){
      for(let y = 1; y <= this.GridY; y++){
        if (this.CurrentPlayer.x == x && this.CurrentPlayer.y == y){
          PlayerIMG.draw(x*64,y*64)
        } else if (this.Grid[x][y].State == 1) {
          Border.draw(x*64,y*64);
        } else if (this.Grid[x][y].State == 2) {
          Blank.draw(x*64,y*64);
        } else if (this.Grid[x][y].State == 3) {
          Block.draw(x*64,y*64);
        } else if (this.Grid[x][y].State == 4) {
          Win.draw(x*64,y*64);
        } else if (this.Grid[x][y].State == 5) {
          Delete.draw(x*64,y*64);
        } else if (this.Grid[x][y].State == 6) {
          if (this.BeatBlockState == false) {
            BeatA.draw(x*64,y*64);
          } else {
            BeatAT.draw(x*64,y*64);
          }
        } else if (this.Grid[x][y].State == 7) {
          if (this.BeatBlockState == true) {
            BeatB.draw(x*64,y*64);
          } else {
            BeatBT.draw(x*64,y*64);
          }
        }
      }
    }
  }
  DisplayGUI(game,sprites){
    if (this.State == "Start"){
      game.drawText(35,15,"Gaming the game epic insane",this.StartFont);
      
    } else if (this.State == "LevelSelection"){
      
    } else if (this.State == "Game"){
      
    } else if (this.State == "Paused"){
      //TBD
    }
  }
  LoadLevel(Next){
    if (this.LevelDataStorage.length < Next){
      if (Next == 8) {
        this.State = "MenuAward";
      }
      return false;
    } else if (this.LevelDataStorage.length >= Next){
      let LevelData = this.LevelDataStorage[Next];
      console.log(Next)
      if (Next == 7) {
        this.State = "MenuAward";
        return false;
      }
      
      this.GenerateGrid();
      this.CurrentPlayer.x = LevelData.StartingPlayerPosition[0];
      this.CurrentPlayer.y = LevelData.StartingPlayerPosition[1];
      this.Grid[LevelData.WinBlock[0]][LevelData.WinBlock[1]].State = 4;
      this.MaxMoves = LevelData.Moves;
      this.Moves = 0;
      this.BeatBlockState = true;

      for (let f = 0; f < LevelData.PushBlocks.length; f++){
        this.Grid[LevelData.PushBlocks[f][0]][LevelData.PushBlocks[f][1]].State = 3;
      }
      for (let p = 0; p < LevelData.BorderBlocks.length; p++){
        this.Grid[LevelData.BorderBlocks[p][0]][LevelData.BorderBlocks[p][1]].State = 1;
      }

      for (let d = 0; d < LevelData.DeleteBlocks.length; d++){
        this.Grid[LevelData.DeleteBlocks[d][0]][LevelData.DeleteBlocks[d][1]].State = 5;
      }

       for (let ba = 0; ba < LevelData.BeatBlocksA.length; ba++){
        this.Grid[LevelData.BeatBlocksA[ba][0]][LevelData.BeatBlocksA[ba][1]].State = 6;
      }
      for (let bb = 0; bb < LevelData.BeatBlocksB.length; bb++){
        this.Grid[LevelData.BeatBlocksB[bb][0]][LevelData.BeatBlocksB[bb][1]].State = 7;
      }

      console.log(this.Grid)
    }
  }
}

//Image Object
class Sprite{
  constructor(image,game,x,y){
    this.game = game;
    this.image = image;
    this.x = (x == undefined)? this.game.width / 2: x;
    this.y = y || this.game.height / 2;
    this.dx = 0;
    this.dy = 0;
    this.dxsign = 1;
    this.dysign = 1;
    this.left = this.x - this.width / 2;
    this.top = this.y - this.height / 2;
    this.right = this.x + this.width / 2;
    this.bottom = this.y + this.height / 2;
    this.angleVector = 0;
    this.angleRotate = 0;
    this.da = 0;
    this.rotate = "still";
    this.speed = 0;
    this.scale = 1;
    this.visible = true;
    this.health = 100
  }
  draw(x,y){
    var pos = {x:x || this.x,y:y || this.y};
    if(this.visible){
      if(this.rotate == "left" || this.rotate == "right" || this.angleRotate != 0){
        this.angleRotate += this.da;
        this.game.context.save();
        this.game.context.translate(pos.x , pos.y );
        this.game.context.rotate(this.angleRotate);
        this.game.context.drawImage(this.image,0, 0,this.image.width,this.image.height,-(this.width / 2),-(this.height / 2),this.width, this.height);
        this.game.context.restore();
      }else{
        this.game.context.drawImage(this.image,0, 0,this.image.width,this.image.height,pos.x - (this.width / 2),pos.y - (this.height / 2),this.width, this.height);
      }
    }
    this.left = pos.x - (this.width / 2);
    this.top = pos.y - (this.height / 2);
    this.right = pos.x + (this.width / 2);
    this.bottom = pos.y + (this.height / 2);
    if(this.game.showBoundingBoxes) drawBoundingBox(this);
  }
  setVector(speed,angleVector){
        if (angleVector == undefined){
            angleVector = Math.degrees(this.angleVector)
        }
        this.angleVector = Math.radians(angleVector)
        this.speed = speed
        this.calculateSpeedDeltas()
  }
  move(bounce){
    if(bounce){
      if(this.left < 0 || this.right > this.game.width){
        this.changeXSpeed();
      }
      if(this.top < 0 || this.bottom > this.game.height){
        this.changeYSpeed();
      }
    }
    this.calculateSpeedDeltas();
    this.x += this.dx * this.dxsign;
    this.y += this.dy * this.dysign;
    this.draw()
  }
  changeXSpeed(dx){
       if(dx == undefined){
           this.dxsign = -this.dxsign;
       }else{
           this.dx = dx;
       }
  }
  changeYSpeed(dy){
       if(dy == undefined){
           this.dysign = -this.dysign;
       }else{
           this.dy = dy;
       }
  }
  calculateSpeedDeltas(){
        this.dx = this.speed * Math.sin(this.angleVector - this.angleRotate - Math.PI);
        this.dy = this.speed * Math.cos(this.angleVector - this.angleRotate - Math.PI);
  }
  moveTo(x,y){
    this.x = x;
    this.y = y;
    this.draw();
  }
  collidedWith(obj){
    return intersectRect(this,obj) && obj.visible;
  }
}
//https://stackoverflow.com/questions/53832174/javascript-override-from-a-non-es6-class-to-an-es6-class
//https://artandlogic.com/2016/05/es6-subclasses-and-object-defineproperty/
Object.defineProperty(Sprite.prototype, "width", {
    get: function() { 
      return this.image.width * this.scale;
    },
        
    configurable: false
});
Object.defineProperty(Sprite.prototype, "height", {
    get: function() {
      return this.image.height * this.scale;
    },
    configurable: false
});


//Animation Object
class Animation extends Sprite{
  constructor(image,frames,game,w,h,x,y){
    super(image,game,x,y)
    this.frameWidth = w;
    this.frameHeight = h;
    this.frames = frames;
    this.frame = 0;
    this.framerate = 0.25;
    this.angle = 0;
    this.scale = 1;
    this.visible = true;
    this.perRow = Math.floor(image.width / w);
  }
  draw(x,y){
      var pos = {x:x || this.x,y:y || this.y};
      this.frame = this.frame % this.frames;
      var row = Math.floor(Math.floor(this.frame) / this.perRow);
      var col = Math.floor(this.frame) % this.perRow;
      this.frame += this.framerate;
      if(this.visible){
        this.game.context.drawImage(this.image,col * this.frameWidth,row * this.frameHeight, this.frameWidth, this.frameHeight,pos.x - (this.frameWidth * this.scale / 2),pos.y - (this.frameHeight * this.scale / 2),this.frameWidth * this.scale, this.frameHeight * this.scale);
      }
      this.left = pos.x - (this.frameWidth * this.scale / 2);
      this.top = pos.y - (this.frameHeight * this.scale / 2);
      this.right = pos.x + (this.frameWidth * this.scale / 2);
      this.bottom = pos.y + (this.frameHeight * this.scale / 2);
      if(this.game.showBoundingBoxes) drawBoundingBox(this);
  }
}

// Supporting Functions
function intersectRect(r1, r2) {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}
function drawBoundingBox(obj){
  obj.game.context.beginPath();
  obj.game.context.rect(obj.left, obj.top, obj.right - obj.left, obj.bottom - obj.top);
  obj.game.context.lineWidth = 7;
  obj.game.context.strokeStyle = 'red';
  obj.game.context.stroke();
}
function randint(sp,range){
  return Math.floor(Math.random()*(range-sp)+sp);
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};
