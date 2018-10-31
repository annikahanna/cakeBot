const Telegraf = require('telegraf');
const {
    Extra,
    Markup
} = require('telegraf');
const dataService = require('./dataService');
const config = require('./config');

const bot = new Telegraf(config.botToken);

//get username for group command handling
bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
    console.log("Initialized", botInfo.username);
});

dataService.loadFiles();


bot.command('start', ctx => {
    dataService.registerUser(ctx);
    ctx.replyWithHTML(
        "Hallo, ich bin der Bot zur durchgehenden Kuchenversorgung.");
});

bot.command('help', ctx => {
    ctx.replyWithHTML(
        "Hallo, ich bin der Bot zur durchgehenden Kuchenversorgung. Mein Prinzip ist relativ simpel, ich möchte gerne fair Kuchen verteilen. \n" +
        "Jeder hat die Möglichkeit Kuchen mitzubringen und bekommt dafür Kuchen gutgeschrieben.\n" +
        "Dafür muss zum Anfang die Größe der Gruppe über /setsize festgelegt werden. Wie oft du \"kostenlos\" Kuchen essen darfst hängt von dieser Größe ab.\n " +
        "Gruppengröße = g; kostenloser Kuchen = k; n = wie oft Kuchen mitgebracht\n" +
        "k = n*g \n" +
        "Man kann auch Kuchen durch Zutaten verdienen\n" +
        " z = wie oft Zutaten gesponsort; k = 1/2 * z*g;\n" +
        "Am Anafang bekommt jeder ein default Kontigent von g\n" +
        "Es werden die folgenden Befehle genutz:\n" +
        "/start - startet Bot\n" +
        "/help - Hilfe\n" +
        "/setsize - Lege die Gruppengröße fest\n" +
        "/about - Info\n"+
        "/sharecake - Teile deinen Kuchen mit allen\n" +
        "/takepiece - Du nimmst dir ein Stück Kuchen\n" +
        "/sponsor - Du sponsorst eine Zutat\n" +
        "/take - Du nimmst eine Zutat\n" +
        "/bake - Wähle einen Kuchen aus den du backen willst\n" +
        "/addcake - Füge einen Kuchen zur Kuchenwunschliste hinzu\n" +
        "/cakelist - die Kuchenwunschliste wird angezeigt\n" +
        "/ingredientlist - die Liste von verfügbaren Zutaten wird angezeigt");
});

bot.command('about', ctx =>{
   ctx.replyWithHTML(
       "Das dazugehörige Repo findest du auf: https://github.com/annikahanna/cakeBot"
   )
});

bot.command('setsize', ctx => {
    var groupSize = "";
    const message = ctx.message.text.split(" ");
    if (message.length > 1) {
        for (let i = 1; i < message.length; i++) {
            groupSize = groupSize + " " + message[i];
        }
        groupSize = groupSize.trim();
        console.log(groupSize);
        if (groupSize == "") {
            ctx.replyWithHTML(
                "Du musst eine Zahl mitangeben um die Gruppengröße zu setzen");
        } else {
            console.log(groupSize);
            ctx.replyWithHTML(
                "Die Gruppengröße wurde auf " + groupSize + " gesetzt");
            dataService.setGroupSize(ctx.chat.id, groupSize);
        }
    }
})

bot.command('takepiece', ctx => {
    var freeCake = dataService.getFreeCake(ctx.chat.id, ctx.from.id);
    if (parseInt(freeCake) > 0) {
        freeCake = parseInt(freeCake) - 1;
        ctx.replyWithHTML(
            ctx.from.first_name + " (@" + ctx.from.username + ") möchte gerne ein Stück Kuchen haben. Du hast noch " + freeCake + " freie Stücke zur Verfügung");
        dataService.setFreeCake(ctx.chat.id, ctx.from.id, freeCake);
    }
    else {
        ctx.replyWithHTML(
            "Du hast leider dein Kontigent aufgebraucht um Kuchen zu konsumieren. Um es aufzufüllen musst du entweder eine Zutat zum Backen sponsoren oder Kuchen mitbringen");
    }

});

bot.command('sharecake', ctx => {
    var freeCake = dataService.getFreeCake(ctx.chat.id, ctx.from.id);
    var groupSize = dataService.getGroupSize(ctx.chat.id);
    freeCake = parseInt(freeCake) + parseInt(groupSize);
    dataService.setFreeCake(ctx.chat.id, ctx.from.id, freeCake);
    ctx.replyWithHTML(
        ctx.from.first_name + " (@" + ctx.from.username + ") stellt Kuchen zur Verfügung. Wenn du ein Stück haben möchtest gib bitte /takepiece ein. " + ctx.from.first_name +
        ", dir stehen " + freeCake + " freie Stücke zur Verfügung");
});


bot.command('sponsor', ctx => {
    var ingredient = ""
    const message = ctx.message.text.split(" ");
    if (message.length > 1) {
        for (let i = 1; i < message.length; i++) {
            ingredient = ingredient + " " + message[i];
        }
        ingredient = ingredient.trim();
    }
    if (ingredient == "") {
        ctx.replyWithHTML(
            "Du musst eine Zutat angeben.");
    } else {
        if (dataService.addIngredient(ingredient, ctx.chat.id)) {
            var freeCake = dataService.getFreeCake(ctx.chat.id, ctx.from.id);
            var groupSize = dataService.getGroupSize(ctx.chat.id);
            freeCake = parseInt(freeCake) + 0.5 * parseInt(groupSize);
            if(groupSize%2 !=0){
                freeCake = parseInt(freeCake)+1;
            }
            dataService.setFreeCake(ctx.chat.id, ctx.from.id, freeCake);
            ctx.replyWithHTML(
                ctx.from.first_name + " (@" + ctx.from.username + ") stellt die Zutat " + ingredient + " zur Verfügung. Dir stehen nun " + freeCake + " freie Stücke zur Verfügung");
        } else {
            ctx.replyWithHTML(
                ingredient + " steht schon auf der Zutatenliste");
        }

    }
});

bot.command('take', ctx => {
    var ingredient = ""
    const message = ctx.message.text.split(" ");
    if (message.length > 1) {
        for (let i = 1; i < message.length; i++) {
            ingredient = ingredient + " " + message[i];
        }
        ingredient = ingredient.trim();
    }
    if (ingredient == "") {
        ctx.replyWithHTML(
            "Du musst die Zutat angeben, die du nehmen willst");
    } else {
        if (dataService.removeIngredient(ingredient, ctx.chat.id)) {
            ctx.replyWithHTML(
                ctx.from.first_name + " (@" + ctx.from.username + ") nimmt die Zutat " + ingredient);
        } else {
            ctx.replyWithHTML(
                ingredient + " steht nicht auf der Zutatenliste");
        }
    }
});

bot.command('addcake', ctx => {
    var cake = ""
    const message = ctx.message.text.split(" ");
    if (message.length > 1) {
        for (let i = 1; i < message.length; i++) {
            cake = cake + " " + message[i];
        }
        cake = cake.trim();
    }
    if (cake == "") {
        ctx.replyWithHTML(
            "Du musst einen Kuchen angeben, den du dir wünscht");
    } else {
        if (dataService.addCake(cake, ctx.chat.id)) {
            ctx.replyWithHTML(
                cake + " wurde auf die Kuchenwunschliste hinzugefügt");
        }
        else {
            ctx.replyWithHTML(
                cake + " steht schon auf der Kuchenwunschliste");
        }

    }
});

bot.command('bake', ctx => {
    var cake = ""
    const message = ctx.message.text.split(" ");
    if (message.length > 1) {
        for (let i = 1; i < message.length; i++) {
            cake = cake + " " + message[i];
        }
        cake = cake.trim();
    }
    if (cake == "") {
        ctx.replyWithHTML(
            "Du musst einen Kuchen angeben, den du backen willst");
    } else {
        if (dataService.removeCake(cake, ctx.chat.id)) {
            ctx.replyWithHTML(
                cake + " wurde von der Kuchenwunschliste entfernt, da " + ctx.from.first_name + " (@" + ctx.from.username + ") den Kuchen backt.");
        }
        else {
            ctx.replyWithHTML(
                cake + " steht nicht auf der Kuchenwunschliste");
        }

    }
});

bot.command('cakelist', ctx => {
    const cakes = dataService.getAllCakes(ctx.chat.id);
    var size = Object.keys(cakes.data).length;
    var cakeListStr = ""
    for (var i = 0; i < size; i++) {
        cakeListStr = cakeListStr + "- " + cakes.data[i] + "\n"
    }
    ctx.replyWithHTML(
        "Es werden sich folgende Kuchen gewünscht:\n" + cakeListStr);

});
bot.command('ingredientlist', ctx => {
    const ingredients = dataService.getAllIngredients(ctx.chat.id);
    var size = Object.keys(ingredients.data).length;
    var ingredientListStr = ""
    for (var i = 0; i < size; i++) {
        ingredientListStr = ingredientListStr + "- " + ingredients.data[i] + "\n"
    }
    ctx.replyWithHTML(
        "Es stehen folgende Zutaten zur Verfügung:\n" + ingredientListStr);

});

bot.startPolling();