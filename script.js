//Game template

//specifies resources
let resources = {images:[
  {id:"Background",src:"images/GenericSquare.png"},
  {id:"ButtonBackground",src:"images/GenericGreenSquare.png"},
  {id:"PushingBlock",src:"images/Arrow.png"},
  {id:"WinBlock",src:"images/Win.png"},
  {id:"Border",src:"images/Border.png"},
  {id:"PlayerIMG",src:"images/Player.png"},
  {id:"BackgroundGame",src:"images/Background.png"},
  {id:"Delete",src:"images/Delete.png"},
  {id:"BeatA",src:"images/BeatA.png"},
  {id:"BeatB",src:"images/BeatB.png"},
  {id:"BeatAT",src:"images/BeatAT.png"},
  {id:"BeatBT",src:"images/BeatBT.png"},
                ],

                 audios:[ 
           
                  ]
                };

// Load resources and starts the game loop
function preload(){
    game = new Game("game");
    game.preload(resources);
    TG = new GameJamming();
    game.state = init;
    gameloop();
}
document.onload = preload();

// Controls the state of the game
function gameloop(){
  game.processInput()

  
  
  if(game.ready){
    game.state();
  }
  if (TG.CountDown == true){
    TG.CountDownPlayerMoveTimer += 1;
    if (TG.CountDownPlayerMoveTimer > 10){
      TG.CountDownPlayerMoveTimer = 0;
      TG.CountDown = false;
      TG.CurrentPlayer.canmove = true;
    }
  }
  
  game.update()
  setTimeout(gameloop,10);
}

// Create game objects and perform any game initialization
function init(){
  ButtonBG = new Sprite(game.images.ButtonBackground,game);
  ButtonBG.scale = 5;
  BG = new Sprite(game.images.Background,game);
  BG.scale = 6.4;
  BGBG = new Sprite(game.images.BackgroundGame,game);
  BGBG.scale = 100;
  Win = new Sprite(game.images.WinBlock,game);
  Push = new Sprite(game.images.PushingBlock,game);
  Delete = new Sprite(game.images.Delete,game);
  BeatA = new Sprite(game.images.BeatA,game);
  BeatB = new Sprite(game.images.BeatB,game);
  BeatAT = new Sprite(game.images.BeatAT,game);
  BeatBT = new Sprite(game.images.BeatBT,game);
  Border = new Sprite(game.images.Border,game);
  Border.scale = 0.15347721822;
  Win.scale = 0.73;
  PlayerIMG = new Sprite(game.images.PlayerIMG,game);
  PlayerIMG.scale = 0.15625;
  Keys = new Keys();
  TG.LoadLevel(0);
  game.state = main;
}

// Game logic
function main(){
  if (TG.State == "Start") {
    TG.DisplayGrid(Border,BG,Push,ButtonBG,PlayerIMG,Delete,BeatA,BeatB,BeatAT,BeatBT);
    game.drawText("Moves Left: "+(TG.MaxMoves-TG.Moves),100,100,TG.MovesFont);
    game.drawText("Level: "+TG.CurrentLevel,100,50,TG.MovesFont);
    let Key = TG.ReturnStateKey();  
    let KeysCheck = TG.CheckForKeys(Key);
    
    if (KeysCheck == Keys.W) {
      TG.MoveChecks(Key,KeysCheck,0,-1);
    } else if (KeysCheck == Keys.A) {
      TG.MoveChecks(Key,KeysCheck,-1,0);
    } else if (KeysCheck == Keys.S) {
      TG.MoveChecks(Key,KeysCheck,0,1);
    } else if (KeysCheck == Keys.D) {
      TG.MoveChecks(Key,KeysCheck,1,0);
    } else if (Key.pressed[Keys.ESCAPE] == true) {
      TG.State = "Pause"
      Key.pressed[Keys.ESCAPE] = false;
      console.log("it works")
    }
  } else if (TG.State == "Pause") {
    let Key = TG.ReturnStateKey(); 
    BGBG.draw(500,500);
 TG.DisplayGrid(Border,BG,Push,ButtonBG,PlayerIMG,Delete,BeatA,BeatB,BeatAT,BeatBT);
    game.drawText("Are You Sure You Want To Exit To Main Menu? ESCAPE to Continue, SPACE to Resume",100,50,TG.MovesFont); 
    if (Key.pressed[Keys.ESCAPE] == true) {
      TG.State = "Menu"
      BGBG.draw(500,500);
    } else if (Key.pressed[Keys.SPACE] == true) {
      TG.State = "Start"
      BGBG.draw(500,500);
    }
  } else if (TG.State == "Menu") {
    BGBG.draw(500,500);
    game.drawText("Programmer and Level Designer: Sean",0,50,TG.MovesFont);
    game.drawText("Audio and Graphics: Shawn and Riley",0,100,TG.MovesFont);
    game.drawText("Bug Fixer: Roy",0,150,TG.MovesFont);
    game.drawText("Welcome to Block Push!",300,200,TG.StartFont);
    ButtonBG.draw(585,300);
    ButtonBG.draw(550,300);
    ButtonBG.draw(500,300);
    ButtonBG.draw(450,300);
    ButtonBG.draw(415,300);
    game.drawText("Select Level!",425,320,TG.StartFont);
    game.drawText("Use WASD to Move",150,350,TG.StartFont);
    game.drawText("Certain Blocks Do Certain Things",150,400,TG.StartFont);
    game.drawText("Push Blocks Can Be Pushed But Are Deleted By Delete Blocks",150,440,TG.StartFont);
    game.drawText("BeatBlocks Turn Off And On If You Push A Push Block",150,480,TG.StartFont);
    game.drawText("Make It To The Win Block Before You Run Out Of Moves To Win!",150,520,TG.StartFont);
    game.drawText("Block Key:",150,600,TG.StartFont);
    game.drawText("Win Block",150,650,TG.StartFont);
    ButtonBG.draw(320,640);
    game.drawText("Border Block",150,725,TG.StartFont);
    Border.draw(370,710);
    game.drawText("Push Block",150,800,TG.StartFont);
    Push.draw(340,780);
    game.drawText("Beat Block (ON)",150,875,TG.StartFont);
    BeatA.draw(405,865);
    BeatB.draw(475,865);
    game.drawText("Beat Block (OFF)",150,950,TG.StartFont);
    BeatAT.draw(415,930);
    BeatBT.draw(490,930);
    
    let Mouse = TG.ReturnStateMouse();

    if (Mouse.leftClick == true) {
      if ((Mouse.x > 383 && Mouse.x < 617) && (Mouse.y > 236 && Mouse.y < 364)){
        TG.State = "Selection";
      }
    }
  } else if (TG.State == "Selection") {
    BGBG.draw(500,500);
    game.drawText("Level Selection!",300,200,TG.StartFont);
    for (let t = 1; t <= 7; t++) {
      TG.LevelSelectGrid[t] = [];
      TG.LevelSelectGrid[t].Clickable = false;
      TG.LevelSelectGrid[t].x = 25 + t*84;
      TG.LevelSelectGrid[t].y = 300;
      TG.LevelSelectGrid[t].Level = t;
          
      if (TG.HighestLevel >= (t)) {
        ButtonBG.draw(25+(t*84),300);
        game.drawText(t,25+(t*84),300,TG.LevelSelectionFont);
        TG.LevelSelectGrid[t].Clickable = true;
      } else {}
    }
    

    let Mouse = TG.ReturnStateMouse();

    if (Mouse.leftClick == true) {
      for (let MC = 1; MC <= 7; MC++) {
        let TargetX = TG.LevelSelectGrid[MC].x;
        let TargetY = TG.LevelSelectGrid[MC].y;
        if ((Mouse.x > TargetX-32 && Mouse.x < TargetX+32) && (Mouse.y > TargetY-32 && Mouse.y < TargetY+32)) {
          if (TG.LevelSelectGrid[MC].Clickable == true) {
            TG.State = "Start";
            TG.CurrentLevel = MC;
            TG.LevelDataLevel = TG.CurrentLevel - 1;
            TG.LoadLevel((MC)-1);
            BGBG.draw(500,500);
          }
        }
      }
    }
  } else if (TG.State == "MenuAward") {
    BGBG.draw(500,500);
    game.drawText("You Beat The Game!!! Good Job!",300,200,TG.StartFont);
    game.drawText("Press ESCAPE To Go Back To The Menu",300,400,TG.StartFont);
    let Key = TG.ReturnStateKey();

    if (Key.pressed[Keys.ESCAPE] == true) {
      TG.State = "Menu"
    }
  }
}

