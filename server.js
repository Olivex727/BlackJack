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

/*
app.get('/image', function (req, res) {
    //if (req.query.img === "bck") {
        var filedata = fs.readFileSync("background.png");
        ri(filedata, function (err, image) {
            if (err) {
                console.log("failed to parse the image")
                console.log(err)
            }
            res.send(image)
        });
        //console.log("jer");
    //}

});
*/

app.listen(3000, function () {
    console.log('listening on port 3000');
});