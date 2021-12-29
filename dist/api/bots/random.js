"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RandomBot {
    identifier = 'random-bot';
    chooseTrumpSuite(_payload) {
        return Math.floor(Math.random() * 4);
    }
    playCard(payload) {
        const cards = payload.your_cards_your_can_play;
        const ix = Math.floor(Math.random() * cards.length);
        return cards[ix];
    }
}
exports.default = RandomBot;
//# sourceMappingURL=random.js.map