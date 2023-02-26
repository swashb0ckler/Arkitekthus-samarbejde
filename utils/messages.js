// used for wrapping a message, so it is not just a string
const moment = require('moment-timezone');
module.exports = formatMessage; 

function formatMessage(username, text, fileName){
    return {
        username, 
        text,
        fileName, 
        time: moment().tz("Europe/Copenhagen").format('dddd h:mm a')
    }
}

