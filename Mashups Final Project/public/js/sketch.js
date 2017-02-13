/**
 * Created by Asfandyar on 12/5/16.
 */

var cards_imgs = {};
var background_img;
var background_text;
var coin;
var button;
var dealer_count;
var settings = false;
var bet_amount = 20;

var button_xpos;
var button_ypos;
var button_w;
var button_h;

var btn_p1;
var btn_p2;
var btn_p3;

var rect_xpos;
var rect_ypos;
var rect_w = 150;
var rect_h = 0;

var loading = false;
var reward = false;
var r_rect_dim = 0;
var game;

function preload() {
    console.log("Preloading Images...");
    var list = [
        '0C', '0D', '0H', '0S', '2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S',
        '4C', '4D', '4H', '4S', '5C', '5D', '5H', '5S', '6C', '6D', '6H', '6S',
        '7C', '7D', '7H', '7S', '8C', '8D', '8H', '8S', '9C', '9D', '9H', '9S',
        'JC', 'JD', 'JH', 'JS', 'QC', 'QD', 'QH', 'QS', 'KC', 'KD', 'KH', 'KS',
        'AC', 'AD', 'AH', 'AS', 'blank'
    ];
    // console.log(list);
    for (var i = 0; i < list.length; i++) {
        var path = "img/" + list[i] + ".png";
        cards_imgs[list[i]] = loadImage(path);
    }
    background_img = loadImage("img/blackjack.png");
    background_text = loadImage("img/Blackjack-Logo.png");
    coin = loadImage("img/coin.png");
    // console.log(cards_imgs);
    console.log("All images preloaded!");
}

function setup() {
    console.log("Running setup...");
    game = new Game();
    createCanvas(windowWidth, windowHeight);
    background(48, 136, 52);
    createButtons();
    clickEvents();
    coin.loadPixels();
    for (var i = 0; i < 4 * (coin.width * coin.height); i += 4) {
        coin.pixels[i + 3] *= 0.5;
    }
    coin.updatePixels();
    console.log("Setup finished!");
}

function windowResized() {
    /**
     * Make the page responsive to changes to window size.
     */
    console.log("Resizing...");
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(48, 136, 52);
    if (game.start == false) {
        startScreen();
        if (settings) {
            loadSettings();
        }
    } else {
        button.hide();
        btn_p1.hide();
        btn_p2.hide();
        btn_p3.hide();
        if (reward) {
            displayReward();
        }
        displayCoin();
        displayDealer();
        displayPlayers(game.players);
        if (game.gameover == false) {
            if (game.dealer_turn == false) {
                showHint();
                game.checkTurn();
            } else {
                dealersTurn();
            }
        } else {
            displayGameOverMsg();
        }

    }
}

function createButtons() {
    button = createButton("Select Players");
    button_w = 1.8 * button.width;
    button_h = 2.5 * button.height;
    button.id("startGameButton");
    button.class("buttons");
    button.size(button_w, button_h);

    button_xpos = windowWidth - 50 - ((button.width + background_text.width ) / 2);
    button_ypos = 50 + background_text.height + 50;

    btn_p1 = createButton("");
    btn_p1.id("btn1");
    btn_p1.class("buttons");
    btn_p1.size(rect_w, rect_h);

    btn_p2 = createButton("");
    btn_p2.id("btn2");
    btn_p2.class("buttons");
    btn_p2.size(rect_w, rect_h);

    btn_p3 = createButton("");
    btn_p3.id("btn3");
    btn_p3.class("buttons");
    btn_p3.size(rect_w, rect_h);

    rect_ypos = button_ypos;
    rect_xpos = button_xpos + button.width / 2 - (150 + 10 + 75);
}

function clickEvents() {
    var btn = $("#startGameButton");
    btn.mouseover(function () {
        if (settings && game.player_count == 0) {
            btn.css("border-color", "red");
            btn.css("color", "red");
        } else {
            btn.css("border-color", "#7CFC00");
            btn.css("color", "#7CFC00");
        }
    });
    btn.mouseout(function () {
        if (!loading) {
            btn.css("border-color", "white");
            btn.css("color", "white");
        }
    });
    button.mouseClicked(function () {
        if (!settings) {
            btn.html("Start Game");
            settings = true;
        } else if (game.player_count != 0) {
            loading = true;
            btn.html("Loading...");
            btn.css("border-color", "#7CFC00");
            btn.css("color", "#7CFC00");
            startNewGame();
            settings = false;
            button.enabled = false;
        }
    });
    btn_p1.mouseClicked(function () {
        game.player_count = 1;
        var btn1 = $("#btn1");
        var btn2 = $("#btn2");
        var btn3 = $("#btn3");
        btn1.css("border-color", "#7CFC00");
        btn1.css("color", "#7CFC00");
        btn2.css("border-color", "white");
        btn2.css("color", "white");
        btn3.css("border-color", "white");
        btn3.css("color", "white");
        // console.log(game.player_count);
    });
    btn_p2.mouseClicked(function () {
        game.player_count = 2;
        var btn1 = $("#btn1");
        var btn2 = $("#btn2");
        var btn3 = $("#btn3");
        btn1.css("border-color", "white");
        btn1.css("color", "white");
        btn2.css("border-color", "#7CFC00");
        btn2.css("color", "#7CFC00");
        btn3.css("border-color", "white");
        btn3.css("color", "white");
        // console.log(game.player_count);
    });
    btn_p3.mouseClicked(function () {
        game.player_count = 3;
        var btn1 = $("#btn1");
        var btn2 = $("#btn2");
        var btn3 = $("#btn3");
        btn1.css("border-color", "white");
        btn1.css("color", "white");
        btn2.css("border-color", "white");
        btn2.css("color", "white");
        btn3.css("border-color", "#7CFC00");
        btn3.css("color", "#7CFC00");
        // console.log(game.player_count);
    });
}

function startScreen() {
    var bw = windowWidth / 1.5;
    var bratio = bw / background_img.width;
    var bh = bratio * background_img.height;
    image(background_img, 0, windowHeight - bh, bw, bh);
    image(background_text, windowWidth - background_text.width - 50, 50);
    button_xpos = windowWidth - 50 - ((button.width + background_text.width ) / 2);
    rect_xpos = button_xpos + button.width / 2 - (150 + 10 + 75);
    button.size(button_w, button_h);
    button.position(button_xpos, button_ypos);
}

function loadSettings() {
    if (button_ypos <= rect_ypos + 50) {
        button_ypos += 2;
        button.position(button_xpos, button_ypos);
        rect_h += 1.4;

        btn_p1.position(rect_xpos, rect_ypos);
        btn_p1.size(rect_w, rect_h);

        btn_p2.position(rect_xpos + 160, rect_ypos);
        btn_p2.size(rect_w, rect_h);

        btn_p3.position(rect_xpos + 320, rect_ypos);
        btn_p3.size(rect_w, rect_h);
    } else {
        $("#btn1").html("1 Player");
        $("#btn2").html("2 Players");
        $("#btn3").html("3 Players");

        btn_p1.position(rect_xpos, rect_ypos);
        btn_p1.size(rect_w, rect_h);


        btn_p2.position(rect_xpos + 160, rect_ypos);
        btn_p2.size(rect_w, rect_h);

        btn_p3.position(rect_xpos + 320, rect_ypos);
        btn_p3.size(rect_w, rect_h);
    }
}

function startNewGame() {
    $("#moreInfo").hide();
    $("#aboutPage").hide();
    loadJSON("/api/get_deck/4", function (d1) {
        loadJSON("/api/shuffle/" + d1.deck_id, function (d2) {
            game.startGame(d2);
            game.addPlayers();
            initialDraw(d2.deck_id);
        });
    });
}

function initialDraw(deck_id) {
    loadJSON("/api/draw_cards/" + deck_id + "/" + 2, function (d1) {
        // console.log(d1);
        game.dealer.drawCards(d1.cards);
        game.deck.remaining = d1.remaining;
        game.dealer.updateScore();
        game.dealer.updateBust();
        dealer_count = game.dealer.cards.length;
        // console.log(game.dealer);
    });
    loadJSON("/api/draw_cards/" + deck_id + "/" + (game.players.length * 2), function (d2) {
        for (var i = 0; i < game.players.length; i++) {
            game.players[i].rounds += 1;
            game.players[i].winnings -= bet_amount;
            game.players[i].bet += bet_amount;
            var cards = d2.cards.slice(i * 2, i * 2 + 2);
            game.players[i].drawCards(cards);
            game.players[i].updateScore();
            game.players[i].updateBust();
        }
        game.deck.remaining = d2.remaining;
        // console.log(game.players);
        game.start = true;
    });
}

function dealersTurn() {
    if (game.dealer.bust == false && game.dealer.stand == false) {
        if (game.dealer.score >= 17) {
            game.dealer.stand = true;
        } else if (dealer_count == game.dealer.cards.length) {
            dealer_count += 1;
            loadJSON("/api/draw_cards/" + game.deck.deck_id + "/" + 1, function (d) {
                game.dealer.drawCards(d.cards);
                game.deck.remaining = d.remaining;
                game.dealer.updateScore();
                game.dealer.updateBust();
            });
        }
    } else {
        game.checkWinner();
    }
}

function displayDealer() {
    var half = windowWidth / 2;
    var r = 0.5;
    var total_width;
    var x, y, w, h;
    var iw = 226;
    var ih = 314;
    textAlign(CENTER, CENTER);
    textSize(20);
    var cards = game.dealer.cards;
    if (cards.length < 2) {
        return;
    }
    var imgs;
    y = 40;
    if (game.dealer_turn == false && game.gameover == false) {
        imgs = [cards[0].img, cards_imgs["blank"]];
        text("Dealer", windowWidth / 2, 20);
    } else {
        imgs = cards.map(function (item) {
            return item.img;
        });
        text("Dealer: " + game.dealer.score, windowWidth / 2, 20);
    }
    w = r * iw;
    h = r * ih;
    total_width = imgs.length * (w + 10);
    var max_w = 4 * (w + 10);
    if (total_width > max_w) {
        r = max_w / total_width;
        w *= r;
        h *= r;
        total_width = imgs.length * (w + 10);
    } else {
        r = 0.5;
        w = r * iw;
        h = r * ih;
        total_width = imgs.length * (w + 10);
    }
    if (game.dealer_turn && !game.gameover) {
        fill(99, 173, 0);
        noStroke();
        rect(half - total_width / 2 - 10, y - 5, total_width + 20, h + 10, 10);
        fill(0);
    }
    for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        x = half - (total_width / 2) + (i / imgs.length * total_width) + 5;
        image(img, x, y, w, h);
    }
}


function displayPlayers(players) {
    var half;
    var r = 0.5;
    var total_width;
    var j, x, y, w, h;
    var iw = 226;
    var ih = 314;
    textAlign(CENTER, CENTER);
    textSize(20);
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        var cards = player.cards;
        var imgs = cards.map(function (item) {
            return item.img;
        });
        w = r * iw;
        h = r * ih;
        total_width = imgs.length * (w + 10);
        var max_w = 4 * (w + 10);
        if (total_width > max_w) {
            r = max_w / total_width;
            w *= r;
            h *= r;
            total_width = imgs.length * (w + 10);
        } else {
            r = 0.5;
            w = r * iw;
            h = r * ih;
            total_width = imgs.length * (w + 10);
        }
        if (player.name == "P1" && cards.length >= 2) {
            half = windowWidth / 2;
            y = windowHeight - h - 40;
            push();
            translate(0, y);
            if (game.turn == 0 && !game.dealer_turn) {
                fill(99, 173, 0);
                noStroke();
                rect(half - total_width / 2 - 10, -5, total_width + 20, h + 10, 10);
            }
            fill(0);
            text("Current hand: " + player.score, windowWidth / 2, h + 20);
            text(player.name + "'s account: $" + player.winnings, windowWidth / 2, -20);

        } else if (player.name == "P2" && cards.length >= 2) {
            half = windowHeight / 2;
            y = h + 40;
            push();
            translate(y, 0);
            rotate(radians(90));
            if (game.turn == 1 && !game.dealer_turn) {
                fill(99, 173, 0);
                noStroke();
                rect(half - total_width / 2 - 10, -5, total_width + 20, h + 10, 10);
            }
            fill(0);
            text(player.name + ": " + player.score, windowHeight / 2, y - 20);
            text(player.name + "'s account: $" + player.winnings, windowHeight / 2, -20);
        } else if (player.name == "P3" && cards.length >= 2) {
            half = windowHeight / 2;
            y = h + 40;
            push();
            translate(windowWidth - y, windowHeight);
            rotate(radians(270));
            if (game.turn == 2 && !game.dealer_turn) {
                fill(99, 173, 0);
                noStroke();
                rect(half - total_width / 2 - 10, -5, total_width + 20, h + 10, 10);
            }
            fill(0);
            text(player.name + ": " + player.score, windowHeight / 2, y - 20);
            text(player.name + "'s account: $" + player.winnings, windowHeight / 2, -20);
        }
        for (j = 0; j < imgs.length; j++) {
            var img = imgs[j];
            x = half - (total_width / 2) + (j / imgs.length * total_width) + 5;
            image(img, x, 0, w, h);
        }
        pop();
    }
}

function displayCoin() {
    imageMode(CENTER);
    image(coin, windowWidth / 2, windowHeight / 2, 290, 290);
    imageMode(CORNER);
}

function showHint() {
    /**
     * Show the hint message for the player actions.
     */

    textAlign(CENTER, CENTER);
    textSize(30);
    var n = 0;
    switch (game.players[game.turn].name) {
        case "P1":
            n = 1;
            break;
        case "P2":
            n = 2;
            break;
        case "P3":
            n = 3;
            break
    }
    text("Player " + n + "!\nPress 'h' to draw\nor\npress 's' to stand.", windowWidth / 2, windowHeight / 2);
}

function displayReward() {
    if (r_rect_dim <= 1.5 * max([windowWidth, windowHeight])) {
        r_rect_dim += 7;
    }
    fill(99, 173, 0);
    noStroke();
    rectMode(CENTER);
    rect(windowWidth / 2, windowHeight / 2, r_rect_dim, r_rect_dim, r_rect_dim / 2);
    fill(0);
    rectMode(CORNER);
}

function displayGameOverMsg() {
    /**
     * Render the game over message based on the player that wins the round.
     */

    // console.log("GAME OVER");
    textAlign(CENTER, CENTER);
    textSize(35);
    var winners = game.players.filter(function (item) {
        return item.win == true;
    });
    var winner_names = winners.map(function (item) {
        return item.name;
    });
    var message = "Winners are: ";
    for (var i = 0; i < winner_names.length; i++) {
        message += winner_names[i];
        if (i != winner_names.length - 1) {
            message += ", ";
        }
    }
    if (winners.length != 0) {
        reward = true;
        text(message + "\nPress 'r' to restart or,\npress 's' to save.", windowWidth / 2, windowHeight / 2);
    } else {
        fill(0);
        displayCoin();
        text("GAME OVER!\nPress 'r' to restart or,\npress 's' to save.", windowWidth / 2, windowHeight / 2);
    }
}

$(document).keydown(function (e) {
    /**
     * Check for key presses and call functions accordingly.
     */
    var curKey = e.key;
    if (game.gameover == false && game.players[game.turn].bust == false && game.dealer_turn == false) {
        switch (curKey) {
            case "h":
                loadJSON("/api/draw_cards/" + game.deck.deck_id + "/" + 1, function (d) {
                    game.players[game.turn].drawCards(d.cards);
                    game.deck.remaining = d.remaining;
                    game.players[game.turn].updateScore();
                    game.players[game.turn].updateBust();
                });
                break;
            case "s":
                game.players[game.turn].stand = true;
                game.turn = (game.turn + 1) % game.player_count;
                break;
        }
    } else if (curKey == "s") {
        for (var j = 0; j < game.player_count; j++) {
            var player = game.players[j];
            player = {"name": player.name, "winnings": player.winnings, "rounds": player.rounds};
            saveData(player);
        }
    }
    if (game.gameover == true && curKey == "r" && game.deck.remaining > 20) {
        game.dealer_turn = false;
        game.dealer.stand = false;
        game.dealer.bust = false;
        game.dealer.cards = [];
        game.dealer.score = 0;

        game.players = game.players.filter(function (item) {
            return item.winnings > 0;
        });
        game.player_count = game.players.length;

        for (var i = 0; i < game.players.length; i++) {
            game.players[i].stand = false;
            game.players[i].bust = false;
            game.players[i].cards = [];
            game.players[i].score = 0;
            game.players[i].bet = 0;
            game.players[i].win = false;
            game.players[i].tie = false;
        }
        game.turn = 0;
        dealer_count = 0;
        initialDraw(game.deck.deck_id);

        game.gameover = false;
        game.start = true;
        reward = false;
        r_rect_dim = 0;
    }
});

function saveData(obj) {
    $.ajax({
        url: '/api/save',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(obj),
        error: function (resp) {
            console.log("Oh no...");
            console.log(resp);
        },
        success: function (resp) {
            console.log('WooHoo!');
            console.log(resp);
        }
    });
}