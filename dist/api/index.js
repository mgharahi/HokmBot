"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const random_1 = __importDefault(require("./bots/random"));
const highcard_1 = __importDefault(require("./bots/highcard"));
const greate_opponent_1 = __importDefault(require("./bots/greate_opponent"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
const ALL_BOTS = [new random_1.default(), new highcard_1.default(), new greate_opponent_1.default()];
ALL_BOTS.forEach(bot => {
    app.use(`/bots/${bot.identifier}`, express_1.default.Router()
        .post('/choose_trump_suite', (req, res) => {
        res.json(bot.chooseTrumpSuite(req.body));
    })
        .post('/play_card', (req, res) => {
        res.json(bot.playCard(req.body));
    }));
});
app.use(express_1.default.Router()
    .get('/ping', (req, res) => {
    res.json('Pong2');
}));
// start server
app.listen(process.env.PORT || 3000, function () {
    console.log(`Web server started at http://localhost${process.env.PORT || 3000}`);
});
//# sourceMappingURL=index.js.map