const Telegraf = require('telegraf');
const {
    Extra,
    Markup
} = require('telegraf');

const config = require('./config');

const bot = new Telegraf(config.botToken);

//get username for group command handling
bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
    console.log("Initialized", botInfo.username);
});

bot.command('start', ctx => {
    ctx.replyWithHTML(
        "Hallo, ich bin der Bot zur durchgehenden Kuchenversorgung.");
});

//Das Prinzip ist relativ simpel...es soll ein faires Kuchenbacksystem entstehen. Jeder hat die Möglichkeit Kuchen mitzubringen und bekommt dafür Kuchen gutgeschrieben.
// Dafür muss zum Anfang die Größe des Kuchenzirkels festgelegt werden. Wie oft ich "kostenlos" Kuchen essen darf hängt von dieser Größe ab. Zirkelgröße = g; kostenloser Kuchen = k; n = wie oft Kuchen mitgebracht
//k = n*g ; man kann auch Kuchen durch Zutaten verdienen; z = wie oft Zutaten gesponsort; k = 1/2 * z*g;
//Am Anafang bekommt jeder ein default Kontigent von g
// Es soll eine Kuchenwunschliste geben, die abgearbeitet werden kann (vielleicht mit API Anbindung)

bot.command('takePiece', ctx => {
    var freeCake = 8;
    if (freeCake >0){
        freeCake--;
        ctx.replyWithHTML(
            ctx.from.first_name + " (@" + ctx.from.username + ") möchte gerne ein Stück Kuchen haben. Du hast noch "+ freeCake+ " freie Stücke zur Verfügung");
    }
    else{
        ctx.replyWithHTML(
            "Du hast leider dein Kontigent aufgebraucht um Kuchen zu konsumieren. Um es aufzufüllen musst du entweder eine Zutat zum Backen sponsoren oder Kuchen mitbringen");
    }

});

bot.command('shareCake', ctx => {
    var freeCake = 8;
    freeCake = freeCake+8;
        ctx.replyWithHTML(
            ctx.from.first_name + " (@" + ctx.from.username + ") stellt Kuchen zur Verfügung. Wenn du ein Stück haben möchtest gib bitte /takePiece ein. "+ ctx.from.first_name +
            " dir stehen "+freeCake+" freie Stücke zur Verfügung");
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

    var freeCake = 8;
    freeCake = freeCake+4;
    ctx.replyWithHTML(
        ctx.from.first_name + " (@" + ctx.from.username + ") stellt die Zutat "+ingredient+ " zur Verfügung. Wenn du die Zutat benötigst gib bitte /take ein."+ ctx.from.first_name +
        " dir stehen nun "+freeCake+" freie Stücke zur Verfügung");
});

bot.command('take', ctx => {
    var freeCake = 8;
    freeCake = freeCake+8;
    ctx.replyWithHTML(
        ctx.from.first_name + " (@" + ctx.from.username + ") nimmt die Zutat");
});

bot.startPolling();