//Canvas Drawing
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

//Screen Info
const size = [canvas.clientWidth, canvas.clientHeight];
const imgsize = [65, 100]

let money = [100, 0, 100, 0] //Player:(Money, Bet), Opponent:(Money, Bet)

let objects =
{
    //Title text objects
    "Title" : { scene:"title", text:"BlackJack", pos:[10, 50], type:"text", click:false, style:"50px Georgia", size:[380, 30]},
    "NewEasy" : { scene:"title", text:"New -- Easy", pos:[10, 50 + size[1] / 5], type:"text", click:true, onclick:"NewGame(false);", style:"30px Georgia", size:[165, 30]},
    "NewHard" : { scene:"title", text:"New -- Hard", pos:[10, 50 + size[1]* 2 / 5], type:"text", click:true, onclick:"NewGame(true);", style:"30px Georgia", size:[165, 30]},
    "Load" : { scene:"title", text:"Load", pos:[10, 50 + size[1]* 3 / 5], type:"text", click:true, onclick:"LoadGame();", style:"30px Georgia", size:[165, 30]},
    
    //Game Boxes
    "SideSec" : { scene:"game", pos:[0, 0], type:"card", click:false, size:[size[0]/4, size[1]], empty:true},
    "DealerSec" : { scene:"game", pos:[0, size[1]/3], type:"card", click:false, size:[size[0]/4, size[1]/3], empty:true},
    "GameSec" : { scene:"game", pos:[size[0]/4, 0], type:"card", click:false, size:[3*size[0]/4, size[1]/2], empty:true},
    
    //Card holders
    //"TestSlot" : { scene:"game", pos:[30, 30], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},
    "Deck" : { scene:"game", pos:[20, (size[1]/2)-imgsize[1]/2], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},
    "O1" : { scene:"game", pos:[(size[0]/4)+20, (size[1]/6)], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},
    //"O2" : { scene:"game", pos:[(size[0]/4)+imgsize[0]+50, (size[1]/6)], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},
    "P1" : { scene:"game", pos:[(size[0]/4)+20, size[1]-(size[1]/6+imgsize[1])], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},
    //"P2" : { scene:"game", pos:[20, (size[1]/2)-imgsize[1]/2], type:"card", click:true/*CHANGE LATER, onclick:"AutoAssign();"*/, size:imgsize, empty:true},

    //Game Information/Buttons
    "PStats" : { scene:"game", text:"Wins: 0, Money: 100", pos:[10, (2*size[1]/3)+30], type:"text", click:false, style:"15px Georgia", size:[165, 30]},
    "OStats" : { scene:"game", text:"Wins: 0, Money: 100", pos:[10, (2*size[1]/3)+30], type:"text", click:false, style:"15px Georgia", size:[165, 30]},
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
    "Deck" : ["2_2", "13_4"], //Cards face-dowm, the main draw pile
    "O1" : [], //Opponent Deck #1
    "O2": [], //Opponent Deck #2
    "P1": [], //Player Deck #1
    "P2": [], //Player Deck #2
}