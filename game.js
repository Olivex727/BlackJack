console.log("START");

//Main game information
let scene = "title";
let gameon = false;
let win = true;
let score = 0;
let difficulty = false;
let moves = 0;

//Set timer and onload events
let timer = window.setInterval(function(){update()}, 1000)

//Get Image module
renderImage = (source, file) => {
    let img = new Image();
    img.src = "/"+file+"/" + source + ".png"
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
    window.addEventListener("click", (event) => {
        detectPress(event.clientX, event.clientY);
    });
    setScene();
    update();
};

function detectPress(x, y){
    x -= 10; y -= 10;
    console.log(x + ", " + y);
    let textGiveway = 0;
    for (let obj in objects) {
        if (objects[obj].scene === scene && objects[obj].click){
            if (objects[obj].type === "text"){textGiveway = objects[obj].size[1]}
            if (objects[obj].pos[0] <= x && x <= objects[obj].pos[0] + objects[obj].size[0]) {
                if (objects[obj].pos[1] - textGiveway <= y && y <= objects[obj].pos[1] + objects[obj].size[1] - textGiveway) {
                    console.log('Clicked: ' +obj);
                    eval(objects[obj].onclick)
                }
            }

        }
    }
    
}

//Updates information below canvas
function update(){
    let time = document.getElementById("time");
    let diff = document.getElementById("diff");
    let sco = document.getElementById("score");
    let mov = document.getElementById("moves");
    if(gameon){
        time.textContent = (parseInt(time.textContent) + 1).toString();
        if(!difficulty){diff.textContent = "Easy"}else{diff.textContent = "Hard"}
    }
    else{
        time.textContent = 0;
        diff.textContent = "Choose an option";
    }
    sco.textContent = score;
    mov.textContent = moves;
}

//Manages Object Placement
function setScene(){
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
                    //ctx.drawImage(renderImage("background2", "bck"), objects[obj].pos[0], objects[obj].pos[1], objects[obj].size[0], objects[obj].size[1]);
                }
            }
        }
    }
}

//Loads a new game
function NewGame(hardmode){
    console.log("Loading Game ...");
    scene = "game";
    gameon = true;
    difficulty = hardmode;
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