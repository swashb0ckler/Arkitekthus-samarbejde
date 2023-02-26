const express = require('express');
const path = require('path');
const http = require('http');
var SocketIOFileUpload = require('socketio-file-upload');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers, addFile, returnFile, clearFile} = require('./utils/users');
let fileUploaded = false;

// Make your Express server:
var app = express()
    .use(SocketIOFileUpload.router)
    .use(express.static(__dirname + "/public"))
    .listen(8000);

// Start up Socket.IO:
var io = socketio(app);
io.sockets.on("connection", function(socket){

    // Make an instance of SocketIOFileUpload and listen on this socket:
    var uploader = new SocketIOFileUpload();
    uploader.dir = "./public/files_dir";
    uploader.listen(socket);

    // Do something when a file is saved:
    uploader.on("saved", function(event){
        console.log(event.file.pathName);
        socket.emit('changeFileColor', `${event.file.pathName}`);
        //extra
        addFile(`${event.file.pathName}`)
        console.log(`Look here --> ${returnFile()}`);
    });

    // Error handler:
    uploader.on("error", function(event){
        //console.log("Error from uploader", event);
    });

      
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room)

        // send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    socket.on('hasBeenClicked', msg => {
        if(msg){
            fileUploaded = true;
        }
    })

    // Needs to catch the chatMessage (1)
    socket.on('chatMessage', msg => {
        if(fileUploaded){
            const user = getCurrentUser(socket.id);
            console.log(msg);
            io.to(user.room).emit('message', formatMessage(user.username,msg, returnFile()));
            clearFile();
        }
        else{
            socket.emit('noFile', true);
        }
        fileUploaded = false;
    })


    // disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        
        if(user){
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
        })
        }
    });

});




