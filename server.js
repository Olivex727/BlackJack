var express = require('express');
var app = express();
const fs = require("fs");

var path = require('path');
const dir = path.join(__dirname, 'public');

//app.use(express.static('public'));
//app.use(express.static('files'));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.sendfile("index.html");
});

app.get('/js', function (req, res) {
    const page = fs.readFileSync("game.js", 'utf8');
    res.send(page);
});

app.get('/css', function (req, res) {
    res.sendfile("style.css");
});

app.listen(3000, function () {
    console.log('listening on port 3000');
});