"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("courtpiece-web/common/utils");
class HighCardBot {
    identifier = 'highcard-bot';
    chooseTrumpSuite(payload) {
        const your_cards = payload.your_cards;
        const suite_collective_ranks = [0, 0, 0, 0];
        your_cards.forEach(card => {
            const suite = (0, utils_1.getSuiteOfCard)(card);
            suite_collective_ranks[suite] = suite_collective_ranks[suite] + (0, utils_1.getRankOfCard)(card);
        });
        // return index of the highest value
        return suite_collective_ranks
            .map((value, index) => ({ index, value }))
            .sort((a, b) => b.value - a.value)[0].index;
    }
    playCard(payload) {
        let [highestRank, high_card] = [-1, -1];
        payload.your_cards_your_can_play.forEach(card => {
            const suite = (0, utils_1.getSuiteOfCard)(card);
            const rank = (0, utils_1.getRankOfCard)(card);
            const effective_rank = suite === payload.trump_suite ? rank * 100 : rank;
            if (effective_rank > highestRank) {
                [highestRank, high_card] = [effective_rank, card];
            }
        });
        return high_card;
    }
}
exports.default = HighCardBot;
//# sourceMappingURL=highcard.js.map