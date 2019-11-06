//Canvas Drawing
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

let objects = {};

//Create object classes

//Card class is for each individual card
class card {
    constructor(num, suite) {
        this.number = num;
        this.suite = suite;
        this.name = num+"_"+suite;
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
}

//The hand class is a group of cards
class hand {
    constructor (name, owner="none", faceup) {
        this.name = name;
        this.deck = []
        this.owner = owner
        this.standing = false; //If the player is able to draw more cards
        this.faceup = faceup; //Number of face-up cards

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

    //Moves cards to a new location/card hand
    movecard(newhand, card){
        for(var i in this.deck){
            if(this.deck[i].name === card){
                this.deck[i].move(newhand.name);
                newhand.deck.push(this.deck[i]);
                this.deck.splice(i, 1);
            }
        }
        
    }
}

//Player class contains all of the movement operations
class player {
    constructor(name, pos=0){
        this.name = name;
        this.pos = [[0, 0], [0, 0]]; //Set the standard position of screen elements
        this.deckno = 0; //Set the deck no. to keep track of objects under split decks
        if(name.startsWith("D")){
            this.isDealer = true;
            this.hand = [new hand(name, name, 1)];
            this.pos[0] = [(size[0]/2)-imgsize[0]/2, (size[1]/6)]
            this.pos[1] = [10 + size[0] / 3, 30];
        }
        else {
            this.hand = [new hand(name + "_1", name, 2)];
            this.money = 100;
            this.bet = 0;
            this.wins = 0;
            this.pos[0] = [((2*pos + 1)*size[0]/6)-imgsize[0]/2, (size[1]/2)+imgsize[1]];
            this.pos[1] = [10, 30*(pos+1)];
        }
        if(name.startsWith("P")) {
            this.isActive = true;
        }
        this.elements = [new element("game", this.pos[0], "card", true, imgsize, true).init(name)];
        this.stats = new element("game", this.pos[1], "text", false, [165, 30], true, null, "("+name+") Wins: 0, Total: [0]", "", "15px Georgia").init(name+"Stats");
    }

    createHand(){} //Create a new hand

    runAI(handindex) { //Run the AI descision making
        let autocommand = "none"; //Determine whether of not a auto animation needs to play

        if (this.isDealer){ //Run dealer algorition
            if (this.hand[handindex].getValue() < 16) {
                this.hit(this.hand[handindex]);
            }
            else {
                this.stand(this.hand[handindex]);
            }
        }

        return autocommand;
    }

    split(deck) {

    }

    hit(deck) {
        console.log(this.name+" Hits on "+deck)
    }

    stand(deck) {

    }

    doubledown(deck) { //Double the bet and add 1 extra card

    }

    insure(deck) { //Insurance

    } 
}

//Controls the screen elements
class element {
    constructor(scene, pos, type, click, size, empty = true, image = "", text = "", onclick = "", style = "15px Georgia") {
        this.scene = scene; this.pos = pos; this.type = type; this.click = click; this.onclick = onclick;
        this.size = size; this.style = style; this.empty = empty; this.text = text; this.image = image; this.name = name;
    }

    //Adds the element to the objects dictionaty
    init(key){
        objects[key] = this
        return this;
    }

    updateimg(newimg){} //Update the image
    requestimg(img){} //Request image from python file
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
    "Deck": new element("game", [20, (size[1] / 3) - imgsize[1] / 2], "card", true, imgsize, true, null /*, "", CHANGE LATER, onclick:"AutoAssign();"*/)
}

let players = [
    new player("D"),
    new player("O1", 1),
    new player("P1", 0),
    new player("O2", 2)
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