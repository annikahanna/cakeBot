const fs = require('fs');
var usrFileName = "./users.json";
var cakeFileName = "./cake.json";
var ingredientFileName = "./ingredient.json";

var users = {};
var usrfileLocked = false;
var cakefileLocked = false;
var ingredientfileLocked = false;


function loadFiles() {
    fs.readFile(usrFileName, (err, data) => {
        if (err) throw err;
        users = JSON.parse(data);
    });
    fs.readFile(cakeFileName, (err, data) => {
        if (err) throw err;
        cakes = JSON.parse(data);
    });
    fs.readFile(ingredientFileName, (err, data) => {
        if (err) throw err;
        ingredients = JSON.parse(data);
    });
}

function saveUsers() {
    if (!usrfileLocked) {
        usrfileLocked = true;
        var json = JSON.stringify(users);
        fs.writeFile(usrFileName, json, 'utf8', function (err) {
            if (err) throw err;
            usrfileLocked = false;
        })
    }
}

function saveCakes() {
    if (!cakefileLocked) {
        fileLocked = true;
        var json = JSON.stringify(cakes);
        fs.writeFile(cakeFileName, json, 'utf8', function (err) {
            if (err) throw err;
            cakefileLocked = false;
        })
    }
}

function saveIngredients() {
    if (!ingredientfileLocked) {
        ingredientfileLocked = true;
        var json = JSON.stringify(ingredients);
        fs.writeFile(ingredientFileName, json, 'utf8', function (err) {
            if (err) throw err;
            ingredientfileLocked = false;
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
                    users[uid].freeCake[id].value = users[uid].groupSize.value;
                }
            }
            else {
                users[uid].freeCake[id] = {};
                users[uid].freeCake[id].value = users[uid].groupSize.value;
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
                users[uid].freeCake[id].value = users[uid].groupSize.value;
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
                users[uid].groupSize = {};
                users[uid].groupSize.value = 1;
            }
        }
        else {
            users[uid].groupSize = {};
            users[uid].groupSize.value = 1;
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

function assertCake(uid) {
    if (cakes[uid]) {
                return true;
    }

    else {
        cakes[uid]={"data":{}};
        saveCakes();
    }
}

function assertIngredient(uid) {
    if (ingredients[uid]) {
        return true;
    }

    else {
        ingredients[uid]={"data":{}};
        saveIngredients();
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

function addCake(cake, uid) {
    assertCake(uid);
    var size = Object.keys(cakes[uid].data).length;
    var newCakeList = {};
    var j = 0;
    console.log(size);
    for (var i = 0; i < size; i++) {
        console.log(cakes[uid].data[i]);
        if (cakes[uid].data[i] != cake) {
            newCakeList[j] = cakes[uid].data[i];
            j = parseInt(j) + 1;
        }
    }
    cakes[uid].data = newCakeList;
    var newSize = Object.keys(cakes[uid].data).length;
    if (size != newSize) {
        return false
    } else {
        newCakeList[j] = cake;
        cakes[uid].data = newCakeList;
        saveCakes();
        return true;
    }
}

function removeCake(cake, uid) {
    assertCake(uid);
    var size = Object.keys(cakes[uid].data).length;
    var newCakeList = {};
    var j = 0;
    console.log(size);
    for (var i = 0; i < size; i++) {
        console.log(cakes[uid].data[i])
        if (cakes[uid].data[i] != cake) {
            newCakeList[j] = cakes[uid].data[i];
            j = parseInt(j) + 1;
        }
    }
    cakes[uid].data = newCakeList;
    saveCakes();
    var newSize = Object.keys(cakes[uid].data).length;
    if (size != newSize) {
        return true
    } else {
        return false;
    }
}

function getAllCakes(uid){
    assertCake(uid);
    return cakes[uid];
}

function addIngredient(ingredient, uid) {
    assertIngredient(uid);
    var size = Object.keys(ingredients[uid].data).length;
    var newIngredientList = {};
    var j = 0;
    console.log(size);
    for (var i = 0; i < size; i++) {
        console.log(ingredients[uid].data[i]);
        if (ingredients[uid].data[i] != ingredient) {
            newIngredientList[j] = ingredients[uid].data[i];
            j = parseInt(j) + 1;
        }
    }
    ingredients[uid].data = newIngredientList;
    var newSize = Object.keys(ingredients[uid].data).length;
    if (size != newSize) {
        return false
    } else {
        console.log(ingredient);
        newIngredientList[j] = ingredient;
        console.log(newIngredientList);
        ingredients[uid].data = newIngredientList;
        saveIngredients();
        return true;
    }
}

function removeIngredient(ingredient, uid) {
    assertIngredient(uid);
    var size = Object.keys(ingredients[uid].data).length;
    var newIngredientList = {};
    var j = 0;
    console.log(size);
    for (var i = 0; i < size; i++) {
        console.log(ingredients[uid].data[i]);
        if (ingredients[uid].data[i] != ingredient) {
            newIngredientList[j] = ingredients[uid].data[i];
            j = parseInt(j) + 1;
        }
    }
    ingredients[uid].data = newIngredientList;
    saveIngredients();
    var newSize = Object.keys(ingredients[uid].data).length;
    if (size != newSize) {
        return true
    } else {
        return false;
    }
}

function getAllIngredients(uid){
    assertIngredient(uid);
    return ingredients[uid];
}

module.exports = {
    loadFiles,
    registerUser,
    getUserList,
    setMetaData,
    getMetaData,
    setFreeCake,
    getFreeCake,
    setGroupSize,
    getGroupSize,
    addCake,
    getAllCakes,
    addIngredient,
    removeIngredient,
    getAllIngredients,
    removeCake
};