const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.get('/', (req, res) => {
    let U = require("./transition.js");
    res.send('<h1>Action Completed</h1>');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});