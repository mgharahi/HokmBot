import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import RandomBot from "./bots/random";
import HighCardBot from "./bots/highcard";
import { TPlayCardPayload, TTrumpSuitePayload } from "./types";
import GrateOpponentBot from "./bots/greate_opponent";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const ALL_BOTS = [new RandomBot(), new HighCardBot(), new GrateOpponentBot()];

ALL_BOTS.forEach(bot => {
  app.use(
    `/bots/${bot.identifier}`,
    express.Router()
      .post('/choose_trump_suite', (req, res) => {
        res.json(bot.chooseTrumpSuite(req.body as TTrumpSuitePayload));
      })
      .post('/play_card', (req, res) => {
        res.json(bot.playCard(req.body as TPlayCardPayload));
      })
  );
});

app.use(
  
  express.Router()
    .get('/ping', (req, res) => {
      res.json('Pong4');
    })
);

// start server
app.listen(process.env.PORT||3000, function () {
  console.log(`Web server started at http://localhost${process.env.PORT || 3000}`);
});