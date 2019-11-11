console.log("START");

/*
function getpy(){
    const x = $.ajax({
        type: "get",
        url: "/py",
        async : false
    })
    console.log(x);
    console.log(x.responseText);
}

//getpy();
*/

//Main game information
let scene = "title";
let gameon = false;
//let win = true;
//let score = 0;
//let difficulty = false;
//let moves = 0;

//Audio values
let jazzplay = false;
let sfxplay = false;

//Card Movement
let drag = null;
let cardDrag = false;
let coords = [0, 0];
let originalpos = [0, 0];

//Set timer and onload events
let timer = window.setInterval(function(){update()}, 1000);
let dragtimer = null;

//Game program variables
let turn = 0;
let turncomp = true;
let endround = false;
let playerturn = false;
let turnhand = -1;

//Get Image module
renderImage = (source, file) => {
    let img = new Image();
    let load = document.getElementById("imgload");
    load.src = "/" + file + "/" + source + ".png";
    img.src = "/"+file+"/" + source + ".png";
    return img;
}

//Keep track of the mouse pointer
//Note: the canvas' top right corner is (10, 10)
let mouseX, mouseY;
window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

//On window load
window.onload = function () {

    //Create game objects
    let deck = new hand("Deck");

    console.log(objects);
    console.log(objects["D"].scene);
    console.log(deck.getValue());

    window.addEventListener("click", (event) => {
        detectPress(event.clientX, event.clientY, "manual"); //Clicking once will create a card drag
    });
    window.addEventListener("dblclick", (event) => {
        detectPress(event.clientX, event.clientY, "auto"); //Clicking twice wiil auto drag
    });

    setScene();
    update();
    audioplay("click");
};

//Runs the game logic and turn structure
function runGame(){

    if (turncomp) { //Check if player/AI has made a move on his hand
        turncomp = false;
        turnhand++
        if (turnhand >= players[turn].hand.length) { //Finish Player's turn
            turnhand = 0;

            if (playerturn){ playerturn = false; }

            if (turn >= players.length){ turn = 0; }
            else { turn++; }

            if (players[turn].isActive){ playerturn = true; }
        }
        if (!playerturn) {
            auto(
                players[turn].runAI(turnhand)
            );
            turncomp = true;
        }
    }
    console.log(playerturn);
    //console.log(players[turn].hand[turnhand]);
}

//Detects and manages the onclick/ondblclick events
function detectPress(x, y, op=""){
    if (cardDrag) {
        cardDrag = false;
        window.clearInterval(dragtimer);
        dragtimer = null;
    }
    else
    {
        x -= 10; y -= 10;
        console.log(x + ", " + y);
        let textGiveway = 0;
        for (let obj in objects) {
            if (objects[obj].scene === scene && objects[obj].click){
                if (objects[obj].type === "text"){textGiveway = objects[obj].size[1]}
                if (objects[obj].pos[0] <= x && x <= objects[obj].pos[0] + objects[obj].size[0]) {
                    if (objects[obj].pos[1] - textGiveway <= y && y <= objects[obj].pos[1] + objects[obj].size[1] - textGiveway) {
                        console.log('Clicked: ' +obj);
                        if(sfxplay){document.getElementById('click').play();}
                        if (objects[obj].type === "card"){
                            drag = obj;
                            coords = [x - objects[obj].pos[0], y - objects[obj].pos[1]];
                            if (op === "manual") {
                                cardDrag = true;
                                dragtimer = window.setInterval(function(){dragObj()}, 10);
                                originalpos = objects[obj].pos;
                                console.log(originalpos);
                            }
                            else if (op === "auto"){
                                objects[drag].pos = originalpos;
                                auto();
                            }
                        }
                        else {eval(objects[obj].onclick)}
                    }
                }

            }
        }
    }
    
}

//Automatic movements (Unused) -- Double Click
function auto(command){
    console.log("Auto Move");
    console.log(command)
}

//Drags the object around the screen, following the mouse
function dragObj() {
    console.log("Manual Move");
    if (mouseX - 30 > 0 && mouseX < 800 && mouseY - 30 > 0 && mouseY < 500) {
        objects[drag].pos = [mouseX - coords[0], mouseY - coords[1]];
    }  
    setScene();
    
}

//Updates information below canvas
function update(){

    let time = document.getElementById("time");
    let diff = document.getElementById("diff");
    //let sco = document.getElementById("score");
    //let mov = document.getElementById("moves");
    if(gameon){
        runGame();
        time.textContent = (parseInt(time.textContent) + 1).toString();
        //if(!difficulty){diff.textContent = "Easy"}else{diff.textContent = "Hard"}
    }
    else{
        time.textContent = 0;
        diff.textContent = "Choose an option";
    }
    //sco.textContent = score;
    //mov.textContent = moves;
}

//Manages Object Placement
function setScene(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ffff00";
    ctx.drawImage(renderImage("background2", "bck"), 0, 0, size[0], size[1]);
    for(let obj in objects)
    {
        if(objects[obj].scene === scene){
            if (objects[obj].type === "text"){
                ctx.fillStyle = "#ffffff";
                ctx.font = objects[obj].style;
                ctx.fillText(objects[obj].text, objects[obj].pos[0], objects[obj].pos[1]);
            }
            if (objects[obj].type === "card"){
                if (objects[obj].empty){
                    ctx.strokeRect(objects[obj].pos[0], objects[obj].pos[1], objects[obj].size[0], objects[obj].size[1]);
                }
                else{
                    //for
                    //ctx.drawImage(renderImage("background2", "bck"), objects[obj].pos[0], objects[obj].pos[1], objects[obj].size[0], objects[obj].size[1]);
                }
            }
        }
    }
}

//Loads a new game
function NewGame(){
    console.log("Loading Game ...");
    scene = "game";
    gameon = true;
    //runGame(false);
    setScene();
    update();
    console.log("Loaded");
}

//Loads an old game
function LoadGame(){
    console.log("Loading Game ...");
    scene = "game";
    gameon = true;
    setScene();
    update();
    //Load the previous save file
    console.log("Loaded");
}

function SaveGame(){
    //Save the current game and override the file
}

//Manages html audio elements
function audioplay(form){
    console.log("AUDIO");
    var aud = document.getElementById(form);
    var audbutton = document.getElementById(form+"_ctrl");
    if(form === "jazz"){
        if (!jazzplay) {
            aud.play();
            jazzplay = true;
            audbutton.src = "/ops/audio_on.png";
        }else{
            aud.pause();
            jazzplay = false;
            audbutton.src = "/ops/audio_off.png";
        }
    }
    else if (form === "click"){
        if(sfxplay) {
            aud.muted = true;
            sfxplay = false;
            audbutton.src = "/ops/audio_off.png";
        } else {
            aud.muted = false;
            sfxplay = true;
            audbutton.src = "/ops/audio_on.png";
        }
    }
    
}