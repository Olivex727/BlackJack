var express = require('express');
var app = express();
var fs = require("fs");
var ri = require('readimage');

var path = require('path');
const dir = path.join(__dirname, 'public');
app.use(express.static(dir));

console.log(dir);

//app.use(express.static(dir));
//app.use(express.static('public'));
//app.use(express.static('files'));

app.get('/', function (req, res) {
    res.sendfile("index.html");
});

app.get('/js', function (req, res) {
    const page = fs.readFileSync("game.js", 'utf8');
    res.send(page);
});

app.get('/objectsjs', function (req, res) {
    const page = fs.readFileSync("objects.js", 'utf8');
    res.send(page);
});

app.get('/css', function (req, res) {
    res.sendfile("style.css");
});

app.get('/py', function (req, res) {
    const spawn = require('child_process').spawn;
    const py = spawn('python', ['test.py', 'lol']);
    py.stdout.on('data', (data) => {
        //res.send (data.toString().split("\n")[0]);
        res.send('lol');
        console.log(data.toString().split("\n")[0]);
    });
});

app.listen(3000, function () {
    console.log('listening on port 3000');
});