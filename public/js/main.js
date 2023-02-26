const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const chooseFile = document.getElementById('choose_file');
const selectFileInfo = document.getElementById('selectFileInfo');
let decider = false;

// get username and room from URL
const {username, room} = Qs.parse(location.search.slice(1)); // there is an error with ? being included, so it is removed. 



//SocketIOFile handling
var siofu = new SocketIOFileUpload(socket);
siofu.listenOnInput(document.getElementById("upload_input"));

// Do something when a file is uploaded:
siofu.addEventListener("complete", function(event){
    console.log(event.file);
});

socket.on('changeFileColor', message => {
    if(message){
        chooseFile.style.color = 'blue';
        selectFileInfo.innerHTML = `<img class="small_file_picture" src="./files_dir/file_icon.png" alt="">`;
        chooseFile.style.fontWeight = '400';
    }
});


// check if there is a file
chooseFile.addEventListener('click', sendClickInfo);

function sendClickInfo(){
    socket.emit('hasBeenClicked', true);
}

socket.on('noFile', msg => {
    if(msg){
        chooseFile.style.color = 'red';
        selectFileInfo.innerHTML = "(You need to select a file)";
        chooseFile.style.fontWeight = '900';
    }
})


// message from server
socket.on('message', message => {
    //console.log(message);
    outputMessage(message);
});

// join chat room
socket.emit('joinRoom', {username, room});

// get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room); 
    outputUsers(users);
})

// message submit 
chatForm.addEventListener('submit', (e) => {
    e.preventDefault(); // we want to prevent the default behavior.
    const msg = e.target.elements.msg.value; 
    socket.emit('chatMessage', msg); 
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus(); 
})

//output server message to dom
function outputMessage(message){
    imgPath = `.${message.fileName.replace("public", ".")}`;
    temp_file_name = imgPath.replace("./files_dir/", "");
    file_name_header = temp_file_name.replace(".", "");
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p><h1>${message.time}<span class="username_header"> - ${message.username}</span></h1></p> 
    <p class="text">
        ${message.text}
    </p>`;
    if(message.fileName!=""){
        div.innerHTML += `<a href="${imgPath}" download><img class="file_picture" src="./files_dir/file_icon.png" alt=""><p id="file_display">${file_name_header}</p></a>`;
    }
    document.querySelector('.chat-messages').appendChild(div);
    chooseFile.style.color = 'black';
    selectFileInfo.innerHTML = "";
    chooseFile.style.fontWeight = '400';
}

// add room name to dom 
function outputRoomName(room){
    roomName.innerText = room;
}

// add users to dom
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

// Toggle sager
function toggleSager(){
    let sager = document.getElementById("sager");
    if (sager.classList.length == 0){
        sager.classList.add("sager");
    } else {
        sager.classList.remove("sager");
    }
}

window.onload = function url(){
    let url = document.getElementsByClassName("urlLink");
    let sager = ["Lindbjerg Skolen","Gasværket, Aarhus Ø","Vikingemuseet Risskov","Nyborg Skolen","Grundstens Huset","Ry-hus"];
    let getRoom = document.getElementById("room-name");
    getRoom.innerText = room;
    for(let i = 0; i < url.length; i++){
        url[i].href = `chat.html?username=${username}&room=${sager[i]}`
    }
    
}

