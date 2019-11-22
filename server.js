//Import node modules
var express = require('express');
var app = express();
var fs = require("fs");
//var ri = require('readimage');

//var cloudinary = require("cloudinary");
//var cl = new cloudinary.Cloudinary({ cloud_name: "bj-ow", secure: true });
//http://res.cloudinary.com/bj-ow/image/upload/sample.jpg

/*
let options = {
    mode: 'text',
    pythonPath: 'test.py',
    pythonOptions: ['-u'], // get print results in real-time
    args: ['1', '2', '3']
};
*/

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


app.get('/image', function (req, res) {
    
    //res.sendfile()

    //var tag = cl.imageTag("card");
    //tag.toHtml();
    //crop: ‘scale’,  width: 400

    /*
    const spawn = require('child_process').spawn;
    const py = spawn('python', ['test.py', '2C']);
    py.stdout.on('data', (data) => {
        //res.send (data.toString().split("\n")[0]);
        res.send('lol');
        console.log(data.toString().split("\n")[0]);
    });
    
    PythonShell.runString('test.py', options, function (err, results) {
        if (err) throw err;
        console.log('finished');
        console.log('results: %j', results);
        res.send('lol');
    });*/
});


//Host to port 3000
app.listen(3000, function () {
    console.log('listening on port 3000');
});