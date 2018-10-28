const fs = require('fs');
var usrFileName = "./users.json";

var users = {};
var fileLocked = false;

function loadUsers() {
    fs.readFile(usrFileName, (err, data) => {
        if (err) throw err;
        users = JSON.parse(data);
    });
}

function saveUsers() {
    if (!fileLocked) {
        fileLocked = true;
        var json = JSON.stringify(users);
        fs.writeFile(usrFileName, json, 'utf8', function (err) {
            if (err) throw err;
            fileLocked = false;
        })
    }
}

function registerUser(msg) {
    var uid = msg.chat.id;
    var usr = {enabled: true, data: {from: msg.from, chat: msg.chat}};
    users[uid] = usr;
    saveUsers();
}

function getUser(uid) {
    return users[uid];
}

function getUserList() {
    return Object.keys(users);
}

function setMetaData(uid, key, val) {
    users[uid].data[key] = val;
    saveUsers();
}

function getMetaData(uid, key) {
    return users[uid].data[key];
}

function assertFreeCake(uid, id) {
    if (users[uid]) {
        if (users[uid].freeCake) {
            if (users[uid].freeCake[id]) {
                if ("value" in users[uid].freeCake[id]) {
                    return true;
                }
                else {
                    users[uid].freeCake[id].value = 0;
                }
            }
            else {
                users[uid].freeCake[id] = {};
                users[uid].freeCake[id].value = 0;
                saveUsers();
            }
        }
        else {
            users[uid].freeCake = {};
            if (users[uid].count && id == '0') {//old counter detected, migrate count
                users[uid].freeCake[id] = {value: users[uid].count};
                delete users[uid].count;
            }
            else {
                users[uid].freeCake[id] = {};
                users[uid].freeCake[id].value = 0;
            }
            saveUsers();
        }
    }
    else {
        //console.log("[ERROR] User ID", uid, "does not exist in database");
        var usr = {
            enabled: true,
            data: {from: undefined, chat: undefined, error: "user was not initialized properly"},
            counter: {"0": {"value": 1}}
        };
        users[uid] = usr;
        saveUsers();
    }
}

function assertGroupSize(uid) {
    if (users[uid]) {
        if (users[uid].groupSize) {
            if ("value" in users[uid].groupSize) {
                return true;
            }
            else {
                users[uid].groupSize.value = 1;
            }
        }
        else {
            users[uid].groupSize = {};
            users[uid].groupSize.value = 0;
        }
        saveUsers();
    }

    else {
        //console.log("[ERROR] User ID", uid, "does not exist in database");
        var usr = {
            enabled: true,
            data: {from: undefined, chat: undefined, error: "user was not initialized properly"},
            counter: {"0": {"value": 1}}
        };
        users[uid] = usr;
        saveUsers();
    }
}

function setFreeCake(uid, id, val) {
    assertFreeCake(uid, id);
    users[uid].freeCake[id].value = val;
    saveUsers();
}

function getFreeCake(uid, id) {
    assertFreeCake(uid, id);
    return users[uid].freeCake[id].value;
}

function setGroupSize(uid, val) {
    assertGroupSize(uid);
    users[uid].groupSize.value = val;
    saveUsers();
}

function getGroupSize(uid) {
    assertGroupSize(uid);
    return users[uid].groupSize.value;
}

module.exports = {
    loadUsers,
    registerUser,
    getUserList,
    setMetaData,
    getMetaData,
    setFreeCake,
    getFreeCake,
    setGroupSize,
    getGroupSize
    //getAllCounters
};