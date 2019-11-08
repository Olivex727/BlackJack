//Import node modules
var express = require('express');
var app = express();
var fs = require("fs");
var ri = require('readimage');

//Get the path of the server and host a static
var path = require('path');
const dir = path.join(__dirname, 'public');
app.use(express.static(dir));

console.log(dir);

//app.use(express.static(dir));
//app.use(express.static('public'));
//app.use(express.static('files'));

//Send the html file
app.get('/', function (req, res) {
    res.sendfile("index.html");
});

//Send the game file
app.get('/js', function (req, res) {
    const page = fs.readFileSync("game.js", 'utf8');
    res.send(page);
});

//Get the objects (In JS form)
app.get('/objectsjs', function (req, res) {
    const page = fs.readFileSync("objects.js", 'utf8');
    res.send(page);
});

//Send the styling script
app.get('/css', function (req, res) {
    res.sendfile("style.css");
});


app.get('/py', function (req, res) {
    const spawn = require('child_process').spawn;
    const py = spawn('python', ['test.py', '2C']);
    py.stdout.on('data', (data) => {
        //res.send (data.toString().split("\n")[0]);
        res.send('lol');
        console.log(data.toString().split("\n")[0]);
    });
});


//Host to port 3000
app.listen(3000, function () {
    console.log('listening on port 3000');
});