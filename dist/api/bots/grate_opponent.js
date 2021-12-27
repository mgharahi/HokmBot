"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("courtpiece-web/common/utils");
class GrateOpponentBot {
    identifier = 'grate-opponent-bot';
    chooseTrumpSuite(payload) {
        const your_cards = payload.your_cards;
        const suite_collective_ranks = [0, 0, 0, 0];
        your_cards.forEach(card => {
            const suite = (0, utils_1.getSuiteOfCard)(card);
            suite_collective_ranks[suite] += (0, utils_1.getRankOfCard)(card);
        });
        // return index of the highest value
        return suite_collective_ranks
            .map((value, index) => ({ index, value }))
            .sort((a, b) => b.value - a.value)[0].index;
    }
    playCard(payload) {
        return 0;
    }
}
exports.default = GrateOpponentBot;
