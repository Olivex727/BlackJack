console.log("BEGIN BLACKJACK");

//Main game information
let scene = "title";
let gameon = false;
let gamestart = true;
let score = 0;
let standing = 0;

//Audio values
let jazzplay = false;
let sfxplay = false;

//Card Movement
let drag = null;
let cardDrag = false;
let coords = [0, 0];
let originalpos = [0, 0];

//Set timer and onload events
let timer = window.setInterval(function(){if(gameon){update()}}, 1000);
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
    deck = new hand("Deck");

    console.log(objects);
    console.log(objects["D"].scene);
    console.log(deck.getValue());

    window.addEventListener("click", (event) => {
        detectPress(event.clientX, event.clientY, "manual"); //Clicking once will create a card drag
    });
    window.addEventListener("dblclick", (event) => {
        detectPress(event.clientX, event.clientY, "auto"); //Clicking twice wiil auto drag
    });

    window.setInterval(function () { setScene();}, 1000)
    update();
    audioplay("click");
    console.log(players);
};

//Runs the game logic and turn structure
function runGame(){
    
    //console.log(totaldecks);
    if(standing >= totaldecks){
        gameon = false;

        //Find the winners of the round
        let dealerval = 0;
        let dealerindex = 0;
        let dealerwin = false;
        let playerindex = 0;
        for (p in players) {
            if (players[p].name === "D") { //Find the greatest dealer value under or at 21
                dealerindex = p;
                for (h in players[p].hand){
                    if (dealerval < players[p].hand[h].getValue() && players[p].hand[h].getValue() <= 21) {
                        dealerval = players[p].hand[h].getValue();
                    }
                }
            }
        }
        let playerval = 0;
        for (p in players) {
            if(players[p].isActive){playerindex = p;}
            for (h in players[p].hand){
                playerval = players[p].hand[h].getValue();
                if (playerval == 21) {
                    //Wins on split aces blackjacks
                    if ((players[p].hand[h].deck[0].number === '1' && players[p].hasSplit) || dealerval == 21) {
                        console.log(players[p].name + " Won 1:1 (NTBJ) on " + players[p].hand[h].name);
                        players[p].wins++;
                        players[p].money += 2*players[p].bet;
                        dealerwin = true;
                    }
                    //Wins on blackjacks
                    else {
                        console.log(players[p].name + " Won 3:2 on " + players[p].hand[h].name);
                        players[p].wins++;
                        players[p].money += Math.round(players[p].bet*2.5);
                    }
                }
                else{
                    //If the player beats the dealer
                    if (playerval > dealerval){
                        console.log(players[p].name + " Won 1:1 on " + players[p].hand[h].name);
                        players[p].wins++;
                        players[p].money += 2*players[p].bet;
                    }
                    //If player ties with dealer
                    else if (playerval == dealerval) {
                        console.log(players[p].name + " Tied on " + players[p].hand[h].name);
                        dealerwin = true;
                        players[p].money += players[p].bet;
                    }
                    //If player looses to the dealer
                    else if (playerval < dealerval) {
                        console.log(players[p].name + " Lost on " + players[p].hand[h].name);
                        //players[p].money -= players[p].bet;
                        dealerwin = true;
                    }
                }
                if (players[p].hand[h].split){
                    players[p].money -= players[p].bet; //Get rid of extra winnings provided by split decks
                }
            }
        }

        //Reset key variables and add win totals to dealer
        totaldecks = 4;
        if (dealerwin){ players[dealerindex].wins++;}
        if(players[playerindex].money > 0) { reset(false); gamestart = true; } else { scene = "title"; reset(true); }
        
    }

    //Perform opening game tasks
    if (gamestart){

        gamestart = false;
        deck.shuffle(10000);

        for (p in players) {
            players[p].pushCard(deck.drawCard(), 0);
            players[p].pushCard(deck.drawCard(), 0);
        }
    }

    if (turncomp && gameon) { //Check if player/AI has made a move on his hand
        turncomp = false;
        turnhand++
        if (turnhand >= players[turn].hand.length) { //Finish Player's turn
            turnhand = 0;

            if (playerturn){ playerturn = false; }

            if (turn >= players.length - 1){ turn = 0; }
            else { turn++; }

            if (players[turn].isActive){ playerturn = true; }
        }
        if (!playerturn) {
            let AIout = players[turn].runAI(turnhand);
            if (AIout[0]){ turnhand--; }
            else{ auto(AIout[1]); }
            turncomp = true;
        }
    }
    console.log(playerturn);
}

//Reset the game either by returning to title or restarting round
function reset(hardreset){
    if (hardreset){
        players = [
            new player("D", null, agro[0]),
            new player("O1", 0, agro[1]),
            new player("P1", 1),
            new player("O2", 2, agro[1])
        ]
    }
    else {
        for (p in players) {
            players[p].hasSplit = false;
            if (players[p].isDealer){players[p].hand = [new hand(players[p].name + "_1", players[p].name, 1)];}
            else {
                players[p].hand = [new hand(players[p].name + "_1", players[p].name, 0)];
                players[p].bet = 0;
                if (players[p].money > 0){
                    let r = 5;
                    if (!players[p].isActive){ r = Math.round(players[p].money/2 * (Math.random() + 0.5)); }
                    while (!players[p].placebet(r, true)) {
                        if (!players[p].isActive){ r = Math.round(players[p].money/2 * (Math.random() + 0.5)); } else { r--; }
                    }
                    players[p].placebet(r);
                }
                else {
                    let n = players.splice(p, 1).name;
                    for (obj in objects){
                        if (obj === n+"stats"){
                            objects[obj].text = "Bankrupt! Wins: " + players[p].wins;
                        }
                    }
                }
            }
        }
        gameon = true;
    }
    deck = new hand("Deck");
}

//Updates the status of the players' info
function updateStats(){
    standing = 0;
    for (p in players){
        let player = players[p];
        for (h in player.hand){
            if (player.hand[h].standDeck('check')){ standing++; }
        }
        if(player.isDealer){ player.stats.changetext("(" + player.name + ") Wins: " + player.wins); }
        else { player.stats.changetext("(" + player.name + ") Wins: " + player.wins + ", Bet: " + player.bet + ", Money: " + player.money);}
    }
    for (obj in objects){
        if (obj === "StandCount") {
            objects[obj].text = "Standing Decks: "+standing;
        }
    }
}

//Detects and manages the onclick/ondblclick events
function detectPress(x, y, op=""){

    //Card Dragging is not used, however it remains in the module
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
                                dragtimer = window.setInterval(function(){/*dragObj()*/}, 10);
                                originalpos = objects[obj].pos;
                            }
                            else if (op === "auto"){
                                objects[drag].pos = originalpos;
                                auto();
                            }
                        }
                        else if (objects[obj].active || objects[obj].type !== "button") {
                            eval(objects[obj].onclick)
                        }
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
    //Update text bars
    updateStats();

    //Update the buttons
    let player = null;
    for (p in players) { //Retreive player data -- read only necessary
        if(players[p].isActive){ player = players[p]; }
    }

    for (obj in objects){
        if(objects[obj].type === "button" && playerturn){
            if ((!player.hand[turnhand].standDeck('check') &&
                ((obj === "Hit Button" && player.hand[turnhand].getValue() < 21) ||
                (obj === "Split Button" && player.checksplit(turnhand)) ||
                (obj === "DD Button" && player.placebet(player.bet, true) && player.hand[turnhand].doubledUp() && player.hand[turnhand].getValue() < 21) ||
                ( !player.hasSplit && (
                (obj === "B+1 Button" && player.placebet(1, true) && player.hand[turnhand].deck.length == 2) ||
                (obj === "B-1 Button" && player.placebet(-1, true) && player.hand[turnhand].deck.length == 2) ||
                (obj === "B+10 Button" && player.placebet(10, true) && player.hand[turnhand].deck.length == 2) ||
                (obj === "B-10 Button" && player.placebet(-10, true) && player.hand[turnhand].deck.length == 2))))
                ) || (obj === "Stand Button"))
            { 
                objects[obj].active = true;
            }
            else {
                objects[obj].active = false;
            }
        }
        else {
            objects[obj].active = false;
        }
    }

    //Update the out-of canvas elements
    let time = document.getElementById("time");
    let sco = document.getElementById("score");
    if(gameon){
        runGame();
        time.textContent = (parseInt(time.textContent) + 1).toString();
        for (p in players) {
            if(players[p].isActive){
                sco.textContent = (players[p].money + players[p].wins).toString();
            }
        }
    }
    else{
        time.textContent = 0;
        sco.textContent = 0;
    }
}

//Manages Object Placement
function setScene(){

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ffff00";
    ctx.drawImage(renderImage("background2", "bck"), 0, 0, size[0], size[1]);

    for(let obj in objects)
    {
        if(objects[obj].scene === scene){
            //Print Text/Label objects
            if (objects[obj].type === "text"){
                ctx.fillStyle = "#ffffff";
                ctx.font = objects[obj].style;
                ctx.fillText(objects[obj].text, objects[obj].pos[0], objects[obj].pos[1]);
            }
            //Print Button objects
            if (objects[obj].type === "button") {
                
                if (objects[obj].active) {
                    ctx.fillStyle = "#c80a0a";
                }
                else {
                    ctx.fillStyle = "#b46464";
                }
                ctx.fillRect(objects[obj].pos[0], objects[obj].pos[1], objects[obj].size[0], objects[obj].size[1]);
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 5;
                ctx.strokeRect(objects[obj].pos[0], objects[obj].pos[1], objects[obj].size[0], objects[obj].size[1]);
                ctx.fillStyle = "#ffffff";
                ctx.font = objects[obj].style;
                ctx.fillText(objects[obj].text, objects[obj].pos[0] + 5, objects[obj].pos[1] + ((3/4)*objects[obj].size[1]));
            }
            //Print Card/Bounding Box objects
            if (objects[obj].type === "card"){
                //Bounding Boxes
                if (objects[obj].empty){
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "#ffff00";
                    ctx.strokeRect(objects[obj].pos[0], objects[obj].pos[1], objects[obj].size[0], objects[obj].size[1]);
                }
                else{
                    //Printing the Deck
                    if(obj === "Deck"){
                        ctx.drawImage(renderImage("back", "cards"), objects[obj].pos[0], objects[obj].pos[1], imgsize[0], imgsize[1]);
                    }
                    //Cardpiles
                    else {
                        for(let p in players){
                            if(obj === players[p].name){
                                let handsize = players[p].getHandInfo("size");
                                let handlen = ((imgsize[0] * (handsize)) + (20 * (handsize-1)))/2;
                                for (let j = 0; j < handsize; j++) {
                                    let cardprint = players[p].returnCards(null, j);
                                    let newposx = objects[obj].pos[0] - (handlen) + (j * (20+imgsize[0]));
                                    for(let i = 0; i < cardprint.length; i++) {
                                        ctx.drawImage(renderImage(cardprint[i], "cards"), newposx, objects[obj].pos[1]+(15 * i), imgsize[0], imgsize[1]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

//Manages the user inputs based on the button press (Conditions are handled with the buttons)
function buttonPress(input){
    console.log("Player input");
    let finised = true;
    let player = players[turn];
    if (input === 'hit'){
        player.hit(turnhand);
        if(player.checksplit(turnhand)){finised = false;}
    }
    if (input === 'stand') {
        player.stand(turnhand);
    }
    if (input === 'split') {
        player.split(turnhand);
        finised = false;
    }
    if (input === 'dd') {
        player.doubledown(turnhand);
    }
    if (input.startsWith("b")) {
       let betplace = input.split("_")[1];
       player.placebet(parseInt(betplace));
       finised = false;
    }
    turncomp = finised;
}

//Loads a new game
function NewGame(){
    console.log("Loading Game ...");
    scene = "game";
    gameon = true;
    gamestart = true;
    setScene();
    update();
    console.log("Loaded");
}

//Changes to the options menu
function Options(entering){
    if(entering){
        console.log("Options Menu");
        scene = "ops";
        console.log("Loaded");
    }
    else {
        console.log("Title Screen");
        scene = "title";
        console.log("Loaded");
    }
}

//Changes the difficulty settings of the players involved
function ChangeDifficulty(dealer){
    let i = 1; if (dealer) { i = 0; }
    if (agro[i] >= 5){
        agro[i] = 0;
    }
    else {
        agro[i]++;
    }
    objects["DealDiff"].changetext("Dealer Difficulty: "+agro[0]);
    objects["OppDiff"].changetext("Opponent Difficulty: " + agro[1]);
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