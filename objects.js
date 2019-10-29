//Canvas Drawing
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

let objects = [];

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
    constructor (name, owner="none") {
        this.name = name;
        this.deck = []
        this.owner = owner
        this.standing = false;
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

class player {
    constructor(name){
        this.name = name;
        if(name.startsWith("D")){
            this.isDealer = true;
            this.hand = [new hand(name, name)];
            this.elements = [new element("game", [(size[0]/2)-imgsize[0]/2, (size[1]/6)], "card", true, imgsize, true)]
            objects[name] = this.elements[0];
        }
        else {
            this.hand = [new hand(name + "_1", name)];
            this.money = 100;
            this.bet = 0;
            this.wins = 0;
        }
        if(name.startsWith("P")) {
            this.isActive = true;
        }
    }

    split(deck){}
    hit(deck){}
    stand(deck){}
    doubledown(deck){} //Double the bet and add 1 extra card
    runAI(){} //Run the AI descision making
    insure(deck){} //Insurance
}

class element {
    constructor(scene, pos, type, click, size, empty = true, image = "", name = "", text = "", onclick = "", style = "15px Georgia") {
        this.scene = scene; this.pos = pos; this.type = type; this.click = click; this.onclick = onclick;
        this.size = size; this.style = style; this.empty = empty; this.text = text; this.image = image; this.name = name;
    }

    updateimg(newimg){} //Update the image
    requestimg(img){} //Request image from python file
}

//Screen Info
const size = [canvas.clientWidth, canvas.clientHeight];
const imgsize = [65, 100]

let money = [100, 0, 100, 0] //Player:(Money, Bet), Opponent:(Money, Bet)

objects =
{
    //Title text objects
    "Title" : { scene:"title", text:"BlackJack", pos:[10, 50], type:"text", click:false, style:"50px Georgia", size:[380, 30]},
    "NewEasy" : { scene:"title", text:"New -- Easy", pos:[10, 50 + size[1] / 5], type:"text", click:true, onclick:"NewGame(false);", style:"30px Georgia", size:[165, 30]},
    "NewHard" : { scene:"title", text:"New -- Hard", pos:[10, 50 + size[1]* 2 / 5], type:"text", click:true, onclick:"NewGame(true);", style:"30px Georgia", size:[165, 30]},
    "Load" : { scene:"title", text:"Load", pos:[10, 50 + size[1]* 3 / 5], type:"text", click:true, onclick:"LoadGame();", style:"30px Georgia", size:[165, 30]},
    
    //Game Boxes
    "DealerSec" : { scene:"game", pos:[size[0]/3, 0], type:"card", click:false, size:[size[0]/3, size[1]/2], empty:true},
    "GameSec" : { scene:"game", pos:[0, 0], type:"card", click:false, size:[size[0], size[1]/2], empty:true},
    
    //Card holders
    //"TestSlot" : { scene:"game", pos:[30, 30], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},
    "Deck" : { scene:"game", pos:[20, (size[1]/3)-imgsize[1]/2], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},
    "O1" : { scene:"game", pos:[(size[0]/6)-imgsize[0]/2, (size[1]/2)+imgsize[1]], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},
    "P" : { scene:"game", pos:[(size[0]/2)-imgsize[0]/2, (size[1]/2)+imgsize[1]], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},
    "O2" : { scene:"game", pos:[(5*size[0]/6)-imgsize[0]/2, (size[1]/2)+imgsize[1]], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},
    //"D" : { scene:"game", pos:[(size[0]/2)-imgsize[0]/2, (size[1]/6)], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},

    //Game Information/Buttons
    "PStats" : { scene:"game", text:"(Player) Wins: 0, Money: 100, Total: [0]", pos:[10, 30], type:"text", click:false, style:"15px Georgia", size:[165, 30]},
    "O1Stats": { scene: "game", text: "(Op 1) Wins: 0, Money: 100, Total: [0]", pos:[10, 60], type:"text", click:false, style:"15px Georgia", size:[165, 30]},
    "O2Stats": { scene: "game", text: "(Op 2) Wins: 0, Money: 100, Total: [0]", pos: [10, 90], type: "text", click: false, style: "15px Georgia", size: [165, 30] },
    "DStats": { scene: "game", text: "(Dealer) Wins: 0, Total: [0]", pos: [10+size[0]/3, 30], type: "text", click: false, style: "15px Georgia", size: [165, 30] },
}

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

let gamedata = //Dictionary is empty and randomly assorted
{
    "Deck" : [], //Cards face-dowm, the main draw pile
    "O1" : [], //Opponent Deck #1
    "O2": [], //Opponent Deck #2
    "P1": [], //Player Deck #1
    "P2": [], //Player Deck #2
}