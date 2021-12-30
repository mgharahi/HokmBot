import { CardDetails, CardTags } from './../types';
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

    playCard(data: TPlayCardPayload): PlayingCard {
         
        let result:number = 0;
        let vector = this.GetCardsVector(data);
        let floorTrump:number|null = this.getFloorTrump(data.floor_cards);
        result = this.SelectBestToPlay(vector,data);

        return result as PlayingCard;
    }
  
    SelectBestToPlay(vector: CardDetails[], data: TPlayCardPayload):number
    {
        let result = 0;

        let strongest = this.getStrongest(data.floor_cards, data.trump_suite);
        
        data.your_cards_your_can_play.some(x=>x==1)
        
        let myStrongest = vector
            .filter(x => data.your_cards_your_can_play.some(y => y == x.Key as PlayingCard))
            .sort((a1,a2)=>a2.NewGlobalRank-a1.NewGlobalRank)[0];

        let myWeakest = vector
            .filter(x => data.your_cards_your_can_play.some(y => y == x.Key as PlayingCard))
            .sort((a1,a2)=>a1.NewGlobalRank-a2.NewGlobalRank)[0];
            

        //Its not the first
        if (strongest) {
            let v = vector[strongest];
            if (v.Tags.some(x => x == CardTags.MyFriend)) {
                result = vector
                    .filter(x => data.your_cards_your_can_play.some(y => y == x.Key as PlayingCard))
                    .sort((a1,a2)=>a1.NewGlobalRank-a2.NewGlobalRank)[0]
                    .Key;
            }
            else if (v.NewGlobalRank > myStrongest.NewGlobalRank) {
                result = myWeakest.Key;
            }
            else if (v.NewGlobalRank < myStrongest.NewGlobalRank) {
                
                if (data.floor_cards.length == 3) {
                    result = vector
                        .filter(x => data.your_cards_your_can_play.some(y => y == x.Key as PlayingCard))
                        .filter(x => x.NewGlobalRank > v.NewGlobalRank)
                        .sort((a1,a2)=>a1.NewGlobalRank-a2.NewGlobalRank)[0]
                        .Key;
                }
                else {
                    let ms =this.GetMyStrongConsideringPlayedCards(vector,data);
                    if (ms) {
                        result = ms;
                    }
                    else {
                        result = myWeakest.Key;
                    }
                }
            }
        }
        else {
            let ms = this.GetMyStrongConsideringPlayedCards(vector, data);
            if (ms) {
                result = ms;
            }
            else {
                result = myWeakest.Key;
            }
        }

        return result;
    }
 
    GetMyStrongConsideringPlayedCards(vector: CardDetails[], data: TPlayCardPayload):number|null
    {
        let result:number|null= null;

        let s;

        for (let i=0;i<4;i++)
        {
            s = vector
                .filter(x => data.your_cards_your_can_play.some(y => y == x.Key as PlayingCard))
                .find(x =>
                    x.Suit == i &&
                    x.NewGlobalRank == (
                        vector
                            .filter(z => z.Suit == x.Suit)
                            .sort((n1, n2) => n2.NewGlobalRank - n1.NewGlobalRank)[0].NewGlobalRank
                    )
                )
            if (s) {
                result= s.Key;
                break
            }
        }
        return result;
    }

    GetCardsVector(data: TPlayCardPayload):CardDetails[]
    {
        let vector :CardDetails[] = [];
        
        
        for (let i: PlayingCard=0;i<52;i++)
        {
            let x:CardDetails={ NewGlobalRank : 0, Rank:0, Suit:0, Tags:[],Key:i};
            vector.push(x);

            vector[i].Suit = getSuiteOfCard(i as PlayingCard);
            vector[i].Rank = getRankOfCard(i as PlayingCard);

            let floorTrump:number|null = this.getFloorTrump(data.floor_cards);
            vector[i].NewGlobalRank = this.getNewGlobalRank(i, data.trump_suite, floorTrump);

            if (data.tricks.some(x => x.cards.some(y => y == i))) {
                vector[i].NewGlobalRank *= -1;
            }

            let wasItForMyFriend:boolean|null = this.WasItForMyFriend(data.floor_cards, i);
            if (wasItForMyFriend!=null) {
                if (wasItForMyFriend) {
                    vector[i].Tags.push(CardTags.MyFriend);
                }
                
            }

            // if (data.your_cards_your_can_play.some(x => x == i)) {
            //     vector[i].Tags.push(CardTags.CanPlay);
            // }
        }
        return vector;
    }

    getFloorTrump(floor_cards: number[]): number | null {
        return floor_cards ? (getSuiteOfCard(floor_cards[0] as PlayingCard)) : null;
    }

    getNewGlobalRank(card: number, trump: number, floorTrump:number|null):number{
        let result:number = 0;
        if (getSuiteOfCard(card as PlayingCard) == trump) {
            result = getRankOfCard(card as PlayingCard) + 200;
        }
        else if (floorTrump && floorTrump == getSuiteOfCard(card as PlayingCard)) {
            result = (getRankOfCard(card as PlayingCard)) + 100;
        }
        else {
            result = getRankOfCard(card as PlayingCard);
        }
        return result;
    }

    WasItForMyFriend(floorCards:number[], card:number):boolean|null
    {
         let result:boolean|null = null;
        if (floorCards.length > 0) {
            //2 cards are on the floor
            if (floorCards.length % 2 == 0) {
                if (floorCards[0] == card) {
                    result = true;
                }
                else if (floorCards[1] == card) {
                    result = false;
                }
            }
            //1 or 3 cards are on the floor
            else {
                if (floorCards[1] == card) {
                    result = true;
                }
                else if (floorCards[0] == card || floorCards[2] == card) {
                    result = false;
                }
            }
        }
        return result;
    }

    getStrongest(cards:number[], trump_suite:number):number|null
    {
        let strongest:number|null = null;;
        if (cards.length > 0) {
            let suitsOnTheFloor = cards.filter(x => getSuiteOfCard(x as PlayingCard) == trump_suite);

            //There is trump on the floor
            if (suitsOnTheFloor.length > 0) {
                strongest = suitsOnTheFloor.sort((a1,a2)=>a2-a1)[0];
            }
            else {
                let floorSuit = getSuiteOfCard(cards[0] as PlayingCard);
                strongest = cards.filter(x => getSuiteOfCard(x as PlayingCard) == floorSuit).sort((a1, a2) => a2 - a1)[0];
            }
        }
        return strongest;
    }
}
