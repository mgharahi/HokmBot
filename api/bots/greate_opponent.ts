import { CardDetails } from './../types';
import { PlayingCardSuite, PlayingCard } from "courtpiece-web/common/types";
import { getSuiteOfCard, getRankOfCard } from "courtpiece-web/common/utils";
import { TBot, TPlayCardPayload, TTrumpSuitePayload } from "../types";

export default class GreateOpponentBot implements TBot {
    identifier = 'grate-opponent-bot'

    chooseTrumpSuite(payload: TTrumpSuitePayload): PlayingCardSuite {
        
        const your_cards = payload.your_cards;
        const suite_collective_ranks = [0, 0, 0, 0];
        your_cards.forEach(card => {
            const suite = getSuiteOfCard(card);
            suite_collective_ranks[suite] += getRankOfCard(card);
        });

        // return index of the highest value
        return suite_collective_ranks
            .map((value, index) => ({ index, value }))
            .sort((a, b) => b.value - a.value)
        [0].index as PlayingCardSuite;
    }

    playCard(payload: TPlayCardPayload): PlayingCard {
         
        return 0;
    }

    SelectBestToPlay(vector:CardDetails[],floorTrump? :number):number
    {
        return 0;
    }

    GetMyStrongConsideringPlayedCards(vector: CardDetails[]):number|null
    {
        return null;
    }

    GetCardsVector(payload: TPlayCardPayload):CardDetails[]
    {
        let x :CardDetails[] = [];
        x.push({ Rank: 0, NewGlobalRank: 0, Suit: 0, Key: 0, Tags:[]});
        return x;
    }

    getFloorTrump(floor_cards: number[]): number | null {
        return null;
    }

    getNewGlobalRank(card: number, trump: number, floorTrump?:number):number{
        return 0;
    }

    WasItForMyFriend(floorCards:number[], card:number):boolean|null
    {
        return null
    }

    getStrongest(cards:number[], trump_suite:number):number|null
    {
        return null;
    }
}
