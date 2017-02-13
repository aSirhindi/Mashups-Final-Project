/**
 * Created by Asfandyar on 11/1/16.
 */
function Game() {
    this.start = false;
    this.gameover = false;
    this.deck = null;
    this.dealer = null;
    this.player_count = 0;
    this.turn = 0;
    this.players = [];
    this.dealer_turn = false;
}

Game.prototype.startGame = function (api_deck) {
    // var deck_id = this.deck.deck_id;
    this.deck = new Deck(api_deck);
    this.dealer = new Player("dealer");
};

Game.prototype.addPlayers = function () {
    for (var i = 0; i < this.player_count; i++) {
        var name = "P" + (i + 1);
        this.players.push(new Player(name));
    }
};

Game.prototype.checkTurn = function () {
    if (this.players[this.turn].stand || this.players[this.turn].bust) {
        if (this.turn == this.player_count - 1) {
            this.dealer_turn = true;
        } else {
            this.turn += 1
        }
    }
};

Game.prototype.checkWinner = function () {
    for (var i = 0; i < this.player_count; i++) {
        if (this.players[i].bust == false && this.dealer.bust == false && this.dealer.stand == true) {
            if (this.players[i].score > this.dealer.score) {
                this.players[i].win = true;
            } else if (this.players[i].score == this.dealer.score) {
                this.players[i].tie = true;
            }
        }
        if (this.dealer.bust == true && this.players[i].bust == false) {
            this.players[i].win = true;
        }
        this.players[i].betResults();
    }
    this.gameover = true;
    console.log("Game Over!");
};

function Deck(apiDeck) {
    this.deck_id = apiDeck.deck_id;
    this.remaining = apiDeck.remaining;
}

function Card(apiCard) {
    this.name = apiCard.code;
    this.value = apiCard.value;
    this.img = cards_imgs[this.name];
}

function Player(name) {
    this.name = name;
    this.cards = [];
    this.score = 0;
    this.stand = false;
    this.bust = false;
    this.winnings = 100;
    this.bet = 0;
    this.win = false;
    this.tie = false;
    this.rounds = 0;
}

Player.prototype.drawCards = function (api_cards) {
    // console.log(new_cards);
    for (var i = 0; i < api_cards.length; i++) {
        var new_card = new Card(api_cards[i]);
        this.cards.push(new_card);
    }
};

Player.prototype.updateScore = function () {
    this.score = 0;
    var ace_count = 0;
    for (var i = 0; i < this.cards.length; i++) {
        var value = this.cards[i].value;
        if (value == "JACK" || value == "QUEEN" || value == "KING") {
            this.score += 10;
        } else if (value == "ACE") {
            ace_count += 1;
        } else {
            this.score += int(value);
        }
    }
    var score = this.score;
    var options;
    switch (ace_count) {
        case 0:
            options = null;
            break;
        case 1:
            options = [score + 1, score + 11];
            break;
        case 2:
            options = [score + 2, score + 12];
            break;
        case 3:
            options = [score + 3, score + 13];
            break;
        case 4:
            options = [score + 4, score + 14];
            break;
    }
    if (options != null) {
        if (options[0] <= 21 && options[1] <= 21) {
            if (options[0] >= options[1]) {
                this.score = options[0];
            } else {
                this.score = options[1];
            }
        } else {
            this.score = min(options);
        }
    }
};

Player.prototype.updateBust = function () {
    if (this.score > 21) {
        this.bust = true;
    }
};

Player.prototype.betResults = function () {
    if (this.win) {
        this.winnings += 2 * this.bet;
    } else if (this.tie) {
        this.winnings += this.bet;
    }
    this.bet = 0;
};