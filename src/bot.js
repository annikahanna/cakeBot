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

dataService.loadUsers();


bot.command('start', ctx => {
    dataService.registerUser(ctx);
    ctx.replyWithHTML(
        "Hallo, ich bin der Bot zur durchgehenden Kuchenversorgung.");
});

bot.command('setsize', ctx => {
    const message = ctx.message.text.split(" ");
    if (message.length > 1) {
        var groupSize = "";
        for (let i = 1; i < message.length; i++) {
            groupSize = groupSize + " " + message[i];
        }
        groupSize = groupSize.trim();

        ctx.replyWithHTML(
            "Die Gruppengröße wurde auf " + groupSize + " gesetzt");
        dataService.setGroupSize(ctx.chat.id, groupSize);
    }
    else {
        "Du musst eine Zahl mitangeben um die Gruppengröße zu setzen"
    }
})

//Das Prinzip ist relativ simpel...es soll ein faires Kuchenbacksystem entstehen. Jeder hat die Möglichkeit Kuchen mitzubringen und bekommt dafür Kuchen gutgeschrieben.
// Dafür muss zum Anfang die Größe des Kuchenzirkels festgelegt werden. Wie oft ich "kostenlos" Kuchen essen darf hängt von dieser Größe ab. Zirkelgröße = g; kostenloser Kuchen = k; n = wie oft Kuchen mitgebracht
//k = n*g ; man kann auch Kuchen durch Zutaten verdienen; z = wie oft Zutaten gesponsort; k = 1/2 * z*g;
//Am Anafang bekommt jeder ein default Kontigent von g
// Es soll eine Kuchenwunschliste geben, die abgearbeitet werden kann (vielleicht mit API Anbindung)

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
    const message = ctx.message.text.split(" ");
    if (message.length > 1) {
        ingredient = "";
        for (let i = 1; i < message.length; i++) {
            ingredient = ingredient + " " + message[i];
        }
        ingredient = ingredient.trim();
    }

    var freeCake = dataService.getFreeCake(ctx.chat.id, ctx.from.id);
    var groupSize = dataService.getGroupSize(ctx.chat.id);
    freeCake = parseInt(freeCake) + 0.5 * parseInt(groupSize);
    dataService.setFreeCake(ctx.chat.id, ctx.from.id, freeCake);
    ctx.replyWithHTML(
        ctx.from.first_name + " (@" + ctx.from.username + ") stellt die Zutat " + ingredient + " zur Verfügung. Wenn du die Zutat benötigst gib bitte /take ein. " + ctx.from.first_name +
        ", dir stehen nun " + freeCake + " freie Stücke zur Verfügung");
});

bot.command('take', ctx => {
    ctx.replyWithHTML(
        ctx.from.first_name + " (@" + ctx.from.username + ") nimmt die Zutat");
});

bot.startPolling();