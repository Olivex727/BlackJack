//Canvas Drawing
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

//Screen Info
const size = [canvas.clientWidth, canvas.clientHeight];
const imgsize = [65, 100]

let objects =
{
    "Title" : { scene:"title", text:"Solitaire For One", pos:[10, 50], type:"text", click:false, style:"50px Georgia", size:[380, 30]},
    "NewEasy" : { scene:"title", text:"New -- Easy", pos:[10, 50 + size[1] / 5], type:"text", click:true, onclick:"NewGame(false);", style:"30px Georgia", size:[165, 30]},
    "NewHard" : { scene:"title", text:"New -- Hard", pos:[10, 50 + size[1]* 2 / 5], type:"text", click:true, onclick:"NewGame(true);", style:"30px Georgia", size:[165, 30]},
    "Load" : { scene:"title", text:"Load", pos:[10, 50 + size[1]* 3 / 5], type:"text", click:true, onclick:"LoadGame();", style:"30px Georgia", size:[165, 30]},
    "TestSlot" : { scene:"game", pos:[30, 30], type:"card", click:false/*CHANGE LATER*/, onclick:"AutoAssign();", size:imgsize, empty:true},
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
    "Draw_Pile" : ["2_2", "13_4"], //Cards face-dowm, the main draw pile
    "Place_Pile" : [], //Cards face-up the feed from the draw pile
    "Stacks": [ //Jagged array of each stack (1-6) Cards face-up
        [],
        [],
        [],
        [],
        [],
        []
    ],
    "Hidden": [ //Jagged array of each stack (1-6) Cards face-down
        [],
        [],
        [],
        [],
        [],
        []
    ],
    "Goal": [] //Array of the highest suite values, if all kings, game is won

}