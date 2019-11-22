//Canvas Drawing
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

let objects = {};

let deck = null;

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
        //this.img = this.num+"_"+this.suite+".png"
    }

    move(newhand){
        this.location = newhand;
    }

    getName(){
        return this.number + this.suite;
    }
}

//The hand class is a group of cards
class hand {
    constructor (name, owner="none", facedown) {
        this.name = name;
        this.deck = []
        this.owner = owner
        this.standing = false; //If the player is able to draw more cards
        this.facedown = facedown; //Number of face-up cards}

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
        //console.log(this.deck);
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

    /* Defunct
    getCardArr(){
        let arrCards = []
        for(let c in this.deck){
            let card = this.deck[c];
            arrCards.push(card.getName());
        }
        return arrCards;
    }
    */

    pushCard(card){
        if (!this.standing){
            this.deck.push(card);
        }
    }

    drawCard(){
        return this.deck.pop();
    }

    standDeck(standval){
        if (standval === 'check') { return this.standing; }
        else if (standval) { this.standing = standval; }
        else if (!standval) { this.standing = !standval; }
        
    }

    doubledUp(){
        //console.log(this.deck.length)
        //console.log(this.deck[0].value)
        if (this.deck.length == 2 && this.deck[0].number == this.deck[1].number){
            return true;
        }
        else {
            return false;
        }
    }

    getCardName(items, showfacedown=false){
        let arrCards = [];
        if(items === null){ items = this.deck.length;}
        //console.log(items);
        for (let i = 0; i < items; i++) {
            if (i >= this.deck.length){ break; } //Failsafe
            if(showfacedown){
                arrCards.push(this.deck[i].getName());
            }
            else if (i < items - this.facedown) {
                arrCards.push(this.deck[i].getName());
            }
            else {
                arrCards.push('back');
            }
        }
        //console.log(arrCards);
        return arrCards;
    }
}

//Player class contains all of the movement operations
class player {
    constructor(name, pos=0, agression=null){
        this.name = name;
        this.pos = [[0, 0], [0, 0]]; //Set the standard position of screen elements
        this.deckno = 0; //Set the deck no. to keep track of objects under split decks
        this.agro = agression;
        this.wins = 0;
        if(name.startsWith("D")){
            this.isDealer = true;
            this.hand = [new hand(name + "_1", name, 0/* Change to One Later */)];
            this.pos[0] = [(size[0]/2)/*-imgsize[0]/2*/, (size[1]/6) - 20]
            this.pos[1] = [10 + size[0] / 3, 30];
            //this.bet = 10;
        }
        else {
            this.hand = [new hand(name + "_1", name, 0)];
            this.money = 100;
            this.bet = 0;
            this.pos[0] = [((2*pos + 1)*size[0]/6)/*-imgsize[0]/2*/, (size[1]/2)+imgsize[1] - 20];
            this.pos[1] = [10, 30*(pos+1)];
        }
        if(name.startsWith("P")) {
            this.isActive = true;
        }
        else{
            this.bet = Math.round(50 * (Math.random() + 0.5));
        }
        this.elements = new element("game", this.pos[0], "card", true, imgsize, false).init(name);
        this.stats = new element("game", this.pos[1], "text", false, [165, 30], true, null, "("+name+") Wins: 0, Total: [0]", "", "15px Georgia").init(name+"Stats");
    }

    //Defunct
    sendElementInfo(hand){
        //this.hand[hand].deck.push(new card(13, 'S'));
        //this.hand[hand].deck.push(new card(11, 'D'));
        //this.elements[hand].addhandvalues(this.hand[hand].getCardArr())
    }

    createHand(){
        let handlength = this.hand.length;
        this.hand.push(new hand(name+"_"+handlength, name, 0));
    } //Create a new hand

    runAI(handindex) { //Run the AI descision making
        let command = [false, "none"]; //Also tell extra instructional input for runGame //Determine whether of not a auto animation needs to play

        //this.doubledown(handindex);
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
            let agro = this.agro

            //if (Math.Abs(11 - val)+1)/(21+agro) < rand then DD
            //if ((val+agro)/21 >= rnd) then stand
            //else then hit

            if (this.checksplit(handindex) && !this.hand[handindex].standDeck('check')) { //Player Split the deck
                this.split(handindex);
                command[0] = true;
            }
            else if (2* (Math.abs(11 - val)+ 1) / (21 + agro) < rnd && this.hand[handindex].deck.length == 2 && !this.hand[handindex].standDeck('check')) {
                this.doubledown(handindex);
            }
            else if ((val+agro)/21 >= rnd && !this.hand[handindex].standDeck('check')) {
                this.stand(handindex);
            }
            
            else {
                this.hit(handindex);
                command[0] = this.checksplit(handindex);
            }
        }

        return command;
    }

    checksplit(gamedeck) {
        console.log("CHECK SPLIT: " + this.hand[gamedeck].doubledUp());
        return this.hand[gamedeck].doubledUp();
    }

    split(gamedeck) {
        console.log(this.name + " Splits on " + this.hand[gamedeck].name);
        this.hand.splice(gamedeck+1, 0, new hand(this.name + "_" + (gamedeck + 1), name, 0));
        this.pushCard(this.hand[gamedeck].drawCard(), gamedeck+1);
    }

    hit(gamedeck) {
        console.log(this.name + " Hits on " + this.hand[gamedeck].name);
        this.pushCard(/*new card(8, 'S') -- Uncomment if u want some spades*/deck.drawCard(), gamedeck);
    }

    stand(gamedeck) {
        console.log(this.name + " Stands on " + this.hand[gamedeck].name);
        this.hand[gamedeck].standDeck(true);
    }

    doubledown(gamedeck) { //Double the bet and add 1 extra card
        console.log(this.name + " Doubles Down on " + this.hand[gamedeck].name);
        this.bet *= 2;
        this.hit(gamedeck);
        this.stand(gamedeck);
    }

    /*
    insure(gamedeck) { //Insurance
        console.log(this.name + " Insures " + this.hand[gamedeck].name);
    } 
    */

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

    pushCard(card, gamedeck) {
        this.hand[gamedeck].pushCard(card);
    }

    returnCards(items, deck) {
        return this.hand[deck].getCardName(items);
    }

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
        this.size = size; this.style = style; this.empty = empty; this.text = text; this.image = image;
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

    changetext(text){
        this.text = text;
    }

    addhandvalues(hand){
        this.handvals = hand;
        console.log("HAND: " + hand);
    }

    //addName(name){
    //    this.name = name;
    //}
    //requestimg(img){} //Request image from python file
    //setname(name){
    //    this.name = name;
    //}
}

//Screen Info
const size = [canvas.clientWidth, canvas.clientHeight];
const imgsize = [65, 100]

let money = [100, 0, 100, 0] //Player:(Money, Bet), Opponent:(Money, Bet)

//Dictionary of all screen elements
objects =
{
    //(scene, pos, type, click, size, empty = true, image = "", text = "", onclick = "", style = "15px Georgia")
    //Title text objects
    "Title": new element("title", [10, 50], "text", false, [380, 30], true, null, "BlackJack", "", "50px Georgia"),
    "New": new element("title", [10, 50 + size[1] / 4], "text", true, [380, 30], true, null, "New Game", "NewGame();", "30px Georgia"),
    "Load": new element("title", [10, 50 + size[1] / 2], "text", true, [380, 30], true, null, "Load Game", "LoadGame();", "30px Georgia"),
    
    //Game Boxes/Boundaries and the Deck
    //"DealerSec" : { scene:"game", pos:[size[0]/3, 0], type:"card", click:false, size:[size[0]/3, size[1]/2], empty:true},
    "DealerSec" : new element("game", [size[0]/3, 0], "card", false, [size[0]/3, size[1]/2], true),
    "GameSec": new element("game", [0, 0], "card", false, [size[0], size[1]/2], true),
    //{ scene:"game", pos:[20, (size[1]/3)-imgsize[1]/2], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true}
    "Deck": new element("game", [20, (size[1] / 3) - imgsize[1] / 2], "card", false, imgsize, false, null /*, "", CHANGE LATER, onclick:"AutoAssign();"*/)
}

let players = [
    new player("D", null, 5),
    new player("O1", 0, 1),
    new player("P1", 1),
    new player("O2", 2, 1)
]

/*
 * Card Naming Scheme:
 * 
 * Ace = 1, Numbers 2-10 = 2-10, Jack = 11, Queen = 12, King = 13
 * Put underscore here
 * Spades = 1, Diamonds = 2, Clubs = 3, Hearts = 4
 * 
 * Actual Image Size: 691 by 1056
 * Preset Image Size: 65 by 100
 * 
*/