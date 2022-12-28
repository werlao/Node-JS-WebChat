const express = require('express');
//const session = require('express-session');
//const bodyParser = require('body-parser');
const server = express();

const path = require('path');
const http = require('http').Server(server);
const io = require('socket.io')(http);

server.engine('html', require('ejs').renderFile);
server.set('view engine', 'html');
server.use('/public', express.static(path.join(__dirname, 'public')));
server.set('views', path.join(__dirname, '/views'));

server.get('/',(req,res)=>{
        res.render('logado');
})

var usuariosAtivos = [];
var usuariosAtivosSocket = [];
var usuariosLastID = 0;

io.on("connection", client => {
    client.on("message", mensagem => {
        mensagem = JSON.parse(mensagem);

        switch(mensagem.type){
            case "c":
                usuariosAtivos[usuariosLastID] = mensagem.data;
                usuariosAtivosSocket[usuariosLastID] = client;
                usuariosLastID += 1;

                io.emit("message", JSON.stringify({type: "l", data: usuariosAtivos}));

                break;

            case "m":
                var to = mensagem.data[0];
                var msg = mensagem.data[1];
                var from = usuariosAtivosSocket.indexOf(client);
                var sock = usuariosAtivosSocket[to];

                sock.emit("message", JSON.stringify({type: "m", data: [from, msg]}));

                break;
        }
    });

    client.on("disconnect", () => {
        var id = usuariosAtivosSocket.indexOf(client);

        delete usuariosAtivos[id];
        delete usuariosAtivosSocket[id];

        io.emit("message", JSON.stringify({type: "l", data: usuariosAtivos}));
    });
});

http.listen(4000, function(){
    console.log("Servidor ativo na porta 80");
});