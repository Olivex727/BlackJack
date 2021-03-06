//Canvas Drawing
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

//Create the main game objects
let objects = {};
let deck = null;
let agro = [1, 1]; //Error with double clicking in new scence -- Since it only affects one box, it is not necessary to be fixed
let totaldecks = 4;

//Create object classes

//Card class is for each individual card
class card {
    constructor(num, suite) {
        this.number = num;
        this.suite = suite;
        this.name = num+suite;
        if(num < 11){
            this.value = num;
        }
        else{
            this.value = 10;
        }
        if(num == 1){
            this.isAce = true;
        }
        else {
            this.isAce = false;
        }
        this.location = "Deck";
    }

    //Change the location of the card -- Defunct
    move(newhand){
        this.location = newhand;
    }

    //Get the name of the card
    getName(){
        return this.number + this.suite;
    }
}

//The hand class is a group of cards
class hand {
    constructor (name, owner="none", facedown=0, split=false) {
        this.name = name;
        this.deck = []
        this.owner = owner
        this.standing = false; //If the player is able to draw more cards
        this.facedown = facedown; //Number of face-up cards
        this.split = split;

        if(name === "Deck"){
            for(var s in ["S", "D", "C", "H"]){
                for(var i = 1; i <= 13; i++){
                    this.deck.push(new card(i, ["S", "D", "C", "H"][s]));
                }
            }
            this.shuffle(1000)
            console.log(this.deck);
        }
    }

    //Randomly shuffles the cards
    shuffle(num) {
        for(var i=0; i<num; i++){
            var a = Math.round(Math.random() * (this.deck.length - 1));
            var b = Math.round(Math.random() * (this.deck.length - 1));
            var cardobj = this.deck[a];
            this.deck[a] = this.deck[b];
            this.deck[b] = cardobj;
        }
        
    }

    //Expected deck output = 340
    //Gets the total point value of each card in the deck
    getValue(){
        var total = 0;
        for(var i in this.deck){
            if(!this.deck[i].isAce){
                total += this.deck[i].value;
            }
        }
        for (var i in this.deck) {
            if (this.deck[i].isAce) {
                if (total + 11 > 21){
                    total += 1;
                }
                else {
                    total += 11;
                }
            }
        }
        return total;
    }

    //Add a card to the hand
    pushCard(card){
        if (!this.standing){
            this.deck.push(card);
        }
    }

    //Remove a card from the hand
    drawCard(){
        return this.deck.pop();
    }

    //Make the deck stand so that the card can't be hit on
    standDeck(standval){
        if (standval === 'check') { return this.standing; }
        else if (standval) { this.standing = standval; }
        else if (!standval) { this.standing = !standval; }
        
    }

    //Check if the hand is doubled up
    doubledUp(){
        if (this.deck.length == 2 && this.deck[0].number == this.deck[1].number){
            return true;
        }
        else {
            return false;
        }
    }

    //Gets the array of card names
    getCardName(items, showfacedown=false){
        let arrCards = [];
        if(items === null){ items = this.deck.length;}
        for (let i = 0; i < items; i++) {
            if (i >= this.deck.length){ break; } //Failsafe
            if(showfacedown){
                arrCards.push(this.deck[i].getName());
            }
            else if (i >= this.facedown) {
                arrCards.push(this.deck[i].getName());
            }
            else {
                arrCards.push('back');
            }
        }
        return arrCards;
    }
}

//Player class contains all of the movement operations
class player {
    constructor(name, pos=0, agression=null){
        //Standard variable creation
        this.name = name;
        this.pos = [[0, 0], [0, 0]]; //Set the standard position of screen elements
        this.deckno = 0; //Set the deck no. to keep track of objects under split decks
        this.agro = agression;
        this.wins = 0;
        this.money = 0;
        this.isActive = false; this.isDealer = false; this.hasSplit = false;

        //If the player is the dealer
        if(name.startsWith("D")){
            this.isDealer = true;
            this.hand = [new hand(name + "_1", name, 1)];
            this.pos[0] = [(size[0]/2), (size[1]/6) - 20]
            this.pos[1] = [10 + size[0] / 3, 30];
        }

        //If the player is an opponent/player
        else {
            this.hand = [new hand(name + "_1", name, 0)];
            this.money = 100;
            this.bet = 0;
            this.pos[0] = [((2*pos + 1)*size[0]/6)/*-imgsize[0]/2*/, (size[1]/2)+imgsize[1] - 20];
            this.pos[1] = [10, 30*(pos+1)];
        }

        //If the player is actually a human
        if(name.startsWith("P")) {
            this.isActive = true;
            this.placebet(5);
        }
        //Computer player
        else{
            this.placebet(Math.round(50 * (Math.random() + 0.5)));
        }
        this.elements = new element("game", this.pos[0], "card", true, imgsize, false).init(name);
        this.stats = new element("game", this.pos[1], "text", false, [165, 30], true, null, "("+name+") Wins: 0, Total: [0]", "", "15px Georgia").init(name+"Stats");
    }

    //Create a new hand
    createHand(){
        let handlength = this.hand.length;
        this.hand.push(new hand(name+"_"+handlength, name, 0));
    }

    //Run the AI descision making
    runAI(handindex) {
        let command = [false, "none"]; //Extra instructional input for runGame

        if (this.isDealer) { //Run dealer algorition
            if (this.agro > 3 && this.checksplit(handindex) && !this.hand[handindex].standDeck('check')) {
                this.split(handindex);
                command[0] = true; //Ensure that the dealer can hit on the newly split deck
            }
            else if (this.hand[handindex].getValue() < 15 + this.agro && !this.hand[handindex].standDeck('check')) {
                this.hit(handindex);
                command[0] = this.checksplit(handindex); //Dealer can continue to split the deck
            }
            else {
                this.stand(handindex);
            }
        }
        else { //Regular opponent algoritim
            let rnd = Math.random();
            let val = this.hand[handindex].getValue();
            let agros = this.agro

            //if (Math.Abs(11 - val)+1)/(21+agro) < rand then DD
            //if ((val+agro)/21 >= rnd) then stand
            //else then hit

            if (this.checksplit(handindex) && !this.hand[handindex].standDeck('check')) { //Player Split the deck
                this.split(handindex);
                command[0] = true;
            }
            else if (2 * (Math.abs(11 - val) + 1) / (21 + agros) < rnd && this.hand[handindex].deck.length == 2 && !this.hand[handindex].standDeck('check') && this.placebet(this.bet, true)) {
                this.doubledown(handindex);
            }
            else if ((val+agros)/21 >= rnd+0.5 && !this.hand[handindex].standDeck('check')) {
                this.stand(handindex);
            }
            
            else if (!this.hand[handindex].standDeck('check')) {
                this.hit(handindex);
                command[0] = this.checksplit(handindex);
            }
            else if (this.hand[handindex].standDeck('check')){this.stand(handindex);}
        }

        return command;
    }

    //Check whether the deck can be split
    checksplit(gamedeck) {
        //console.log("CHECK SPLIT: " + this.hand[gamedeck].doubledUp());
        return this.hand[gamedeck].doubledUp();
    }

    //Split the hand
    split(gamedeck) {
        console.log(this.name + " Splits on " + this.hand[gamedeck].name);
        this.hand.splice(gamedeck+1, 0, new hand(this.name + "_" + (gamedeck + 1), name, 0, true));
        this.pushCard(this.hand[gamedeck].drawCard(), gamedeck+1);
        totaldecks++; this.hasSplit = true;
    }

    //Hit the hand
    hit(gamedeck) {
        console.log(this.name + " Hits on " + this.hand[gamedeck].name);
        this.pushCard(deck.drawCard(), gamedeck);
        if (this.hand[gamedeck].getValue() > 21){
            this.stand(gamedeck)
        }
    }

    //Stand the hand
    stand(gamedeck) {
        console.log(this.name + " Stands on " + this.hand[gamedeck].name);
        this.hand[gamedeck].standDeck(true);
    }

    //Double down on the bet -- Affects all split decks
    doubledown(gamedeck) { //Double the bet and add 1 extra card
        console.log(this.name + " Doubles Down on " + this.hand[gamedeck].name);
        this.placebet(this.bet);
        this.hit(gamedeck);
        if (!this.hand[gamedeck].standDeck("check")) {
            this.stand(gamedeck);
        }
    }

    //Place or check if possible the bet
    placebet(num, check=false) {
        if (num >= 5 + (-1 * this.bet) && num <= this.money) {
            if (check){
                return true;
            }
            else {
                this.bet += num;
                this.money -= num;
            }
        }
        else if (check) {
            return false;
        }
    }

    //Moves cards to a new location/card hand
    movecard(newhand, oldhand, card) {
        for (var i in this.deck) {
            if (this.hand[i].name === card) {
                this.hand[i].move(newhand.name);
                newhand.deck.push(this.deck[i]);
                this.hand.splice(i, 1);
            }
        }

    }

    //Move a card to the hand
    pushCard(card, gamedeck) {
        this.hand[gamedeck].pushCard(card);
    }

    //Return the array of cards
    returnCards(items, deck) {
        return this.hand[deck].getCardName(items);
    }

    //Get information about the hand array
    getHandInfo(com) {
        if (com === "size") {
            return this.hand.length;
        }
        if (com === "value") {
            let arrVals = [];
            for (let i = 0; i < this.hand.length; i++) {
                arrVals.push(this.hand[i].getValue());
            }
            return arrVals;
        }
    }
}

//Controls the screen elements
class element {
    constructor(scene, pos, type, click, size, empty = true, image = "", text = "", onclick = "", style = "15px Georgia") {
        this.scene = scene; this.pos = pos; this.type = type; this.click = click; this.onclick = onclick;
        this.size = size; this.style = style; this.empty = empty; this.text = text; this.image = image; this.active = false;
    }

    //Adds the element to the objects dictionaty
    init(key){
        objects[key] = this
        this.key = key;
        return this;
    }

    //Update the element
    updateelement(ret){
        objects[this.key] = this
        if(ret){ return this; }
    }

    //Change the text of the element
    changetext(text){
        this.text = text;
    }

    //Add the hand values to the element -- Defunct
    addhandvalues(hand){
        this.handvals = hand;
        console.log("HAND: " + hand);
    }

    //Allow the button to be pressed
    activateButton(set) {
        if (this.type === "button") {
            this.active = set;
        }
    }
}

//Screen Info
const size = [canvas.clientWidth, canvas.clientHeight];
const imgsize = [65, 100];

//Dictionary of all screen elements
objects =
{
    //Title text objects
    "Title": new element("title", [10, 50], "text", false, [380, 30], true, null, "BlackJack", "", "50px Georgia"),
    "New": new element("title", [10, 50 + size[1] / 4], "text", true, [380, 30], true, null, "New Game", "NewGame();", "30px Georgia"),
    "Ops": new element("title", [10, 50 + size[1] / 2], "text", true, [380, 30], true, null, "Options", "Options(true);", "30px Georgia"),
    
    //Options Menu
    "TitleOps": new element("ops", [10, 50], "text", false, [380, 30], true, null, "Options", "", "50px Georgia"),
    "DealDiff": new element("ops", [10, 50 + size[1] / 4], "text", true, [380, 30], true, null, "Dealer Difficulty: 1 (Click to change)", "ChangeDifficulty(true);", "30px Georgia"),
    "OppDiff": new element("ops", [10, 50 + size[1] / 2], "text", true, [380, 30], true, null, "Opponent Difficulty: 1 (Click to change)", "ChangeDifficulty(false);", "30px Georgia"),
    "BackOps": new element("ops", [10, 50 + size[1] * 3 / 4], "text", true, [380, 30], true, null, "< Back", "Options(false);", "20px Georgia"),

    //Game Button Management
    "Hit Button": new element("game", [10 +(2*size[0]/3), 10], "button", true, [80, 30], true, null, "Hit", "buttonPress('hit');", "20px Arial"),
    "Stand Button": new element("game", [110 + (2 * size[0] / 3), 10], "button", true, [80, 30], true, null, "Stand", "buttonPress('stand');", "20px Arial"),
    "DD Button": new element("game", [10 + (2 * size[0] / 3), 50], "button", true, [80, 30], true, null, "DD", "buttonPress('dd');", "20px Arial"),
    "Split Button": new element("game", [110 + (2 * size[0] / 3), 50], "button", true, [80, 30], true, null, "Split", "buttonPress('split');", "20px Arial"),
    "B+1 Button": new element("game", [10 + (2 * size[0] / 3), 90], "button", true, [80, 30], true, null, "Bet+1", "buttonPress('b_+1');", "20px Arial"),
    "B-1 Button": new element("game", [110 + (2 * size[0] / 3), 90], "button", true, [80, 30], true, null, "Bet-1", "buttonPress('b_-1');", "20px Arial"),
    "B+10 Button": new element("game", [10 + (2 * size[0] / 3), 130], "button", true, [80, 30], true, null, "Bet+10", "buttonPress('b_+10');", "20px Arial"),
    "B-10 Button": new element("game", [110 + (2 * size[0] / 3), 130], "button", true, [80, 30], true, null, "Bet-10", "buttonPress('b_-10');", "20px Arial"),

    "StandCount": new element("game", [10 + (2 * size[0] / 3), 200], "text", false, [380, 30], true, null, "Standing Decks: 0", "", "20px Georgia"),

    //Game Boxes/Boundaries and the Deck
    "DealerSec" : new element("game", [size[0]/3, 0], "card", false, [size[0]/3, size[1]/2], true),
    "GameSec": new element("game", [0, 0], "card", false, [size[0], size[1]/2], true),
    "Deck": new element("game", [20, (size[1] / 3) - imgsize[1] / 2], "card", false, imgsize, false, null)
}

//Define the list of players
let players = [
    new player("D", null, agro[0]),
    new player("O1", 0, agro[1]),
    new player("P1", 1),
    new player("O2", 2, agro[1])
]

/*
 * 
 * Actual Image Size: 691 by 1056
 * Preset Image Size: 65 by 100
 * 
*/