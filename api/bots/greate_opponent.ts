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
        result = this.SelectBestToPlay(vector, floorTrump);

        return result as PlayingCard;
    }
  
    SelectBestToPlay(vector:CardDetails[],floorTrump :number|null):number
    {
        var result = 0;

        var strongestD = vector
            .filter(x => x.Tags.some(y => y == CardTags.StrongestOnTheFloor));

        var myStrongest = vector
            .filter(x => x.Tags.some(y => y == CardTags.CanPlay))
            .sort((a1,a2)=>a2.NewGlobalRank-a1.NewGlobalRank)[0];

        var myWeakest = vector
            .filter(x => x.Tags.some(y => y == CardTags.CanPlay))
            .sort((a1,a2)=>a1.NewGlobalRank-a2.NewGlobalRank)[0];
            

        //Its not first
        if (strongestD.length>0) {
            var strongest = strongestD[0];

            if (strongest.Tags.some(x => x == CardTags.MyFriend)) {
                result = vector
                    .filter(x => x.Tags.some(t => t == CardTags.CanPlay))
                    .sort((a1,a2)=>a1.NewGlobalRank-a2.NewGlobalRank)[0]
                    .Key;
            }
            else if (strongest.NewGlobalRank > myStrongest.NewGlobalRank) {
                result = myWeakest.Key;
            }
            else if (strongest.NewGlobalRank < myStrongest.NewGlobalRank) {
                if (vector.filter(x => x.Tags.some(y => y == CardTags.Floor)).length == 3) {
                    result = vector
                        .filter(x => x.Tags.some(y => y == CardTags.CanPlay) && x.NewGlobalRank > strongest.NewGlobalRank)
                        .sort((a1,a2)=>a1.NewGlobalRank-a2.NewGlobalRank)[0]
                        .Key;
                }
                else {
                    var ms =this.GetMyStrongConsideringPlayedCards(vector);
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
            var ms = this.GetMyStrongConsideringPlayedCards(vector);
            if (ms) {
                result = ms;
            }
            else {
                result = myWeakest.Key;
            }
        }

        return result;
    }
 
    GetMyStrongConsideringPlayedCards(vector: CardDetails[]):number|null
    {
        console.log(vector)

        let result:number|null= null;

        let s0 = vector.find(x=>
                        x.Suit == 0 && 
                        x.Tags.some(y=>y == CardTags.CanPlay) &&
                        x.NewGlobalRank == (
                                         vector
                                        .filter(z=>z.Suit == x.Suit)
                                        .sort((n1,n2)=>n2.NewGlobalRank-n1.NewGlobalRank)[0].NewGlobalRank
                                        )
                        )
        
        let s1 = vector.find(x =>
            x.Suit == 1 &&
            x.Tags.some(y => y == CardTags.CanPlay) &&
            x.NewGlobalRank == (
                vector
                    .filter(z => z.Suit == x.Suit)
                    .sort((n1, n2) => n2.NewGlobalRank - n1.NewGlobalRank)[0].NewGlobalRank
            )
        )

        let s2 = vector.find(x =>
            x.Suit == 2 &&
            x.Tags.some(y => y == CardTags.CanPlay) &&
            x.NewGlobalRank == (
                vector
                    .filter(z => z.Suit == x.Suit)
                    .sort((n1, n2) => n2.NewGlobalRank - n1.NewGlobalRank)[0].NewGlobalRank
            )
        )

        let s3 = vector.find(x =>
            x.Suit == 3 &&
            x.Tags.some(y => y == CardTags.CanPlay) &&
            x.NewGlobalRank == (
                vector
                    .filter(z => z.Suit == x.Suit)
                    .sort((n1, n2) => n2.NewGlobalRank - n1.NewGlobalRank)[0].NewGlobalRank
            )
        )
        

        if (s0) {
            result = s0.Key;
        }

        else if (s1) {
            result = s1.Key;
        }

        else if (s2) {
            result = s2.Key;
        }

        else if (s3) {
            result = s3.Key;
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
                vector[i].Tags.push(CardTags.Played);
                vector[i].NewGlobalRank *= -1;
            }
            else if (data.your_cards.some(x => x == i)) {
                vector[i].Tags.push(CardTags.MyOwn);
            }
            if (data.trump_suite == getSuiteOfCard(i as PlayingCard)) {
                vector[i].Tags.push(CardTags.Trump);
            }
            if (data.floor_cards.some(x => x == i)) {
                vector[i].Tags.push(CardTags.Floor);
            }

            let wasItForMyFriend:boolean|null = this.WasItForMyFriend(data.floor_cards, i);
            if (wasItForMyFriend!=null) {
                if (wasItForMyFriend) {
                    vector[i].Tags.push(CardTags.MyFriend);
                }
                else {
                    vector[i].Tags.push(CardTags.Competitor);
                }
            }

            if (data.your_cards_your_can_play.some(x => x == i)) {
                vector[i].Tags.push(CardTags.CanPlay);
            }
        }

        var stOnTheFloor:number|null = this.getStrongest(data.floor_cards, data.trump_suite);
        if (stOnTheFloor) {
            vector[stOnTheFloor].Tags.push(CardTags.StrongestOnTheFloor);
        }

        return vector;
    }

    getFloorTrump(floor_cards: number[]): number | null {
        return floor_cards ? (getSuiteOfCard(floor_cards[0] as PlayingCard)) : null;
    }

    getNewGlobalRank(card: number, trump: number, floorTrump:number|null):number{
        var result:number = 0;
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
            var suitsOnTheFloor = cards.filter(x => getSuiteOfCard(x as PlayingCard) == trump_suite);

            //There is trump on the floor
            if (suitsOnTheFloor.length > 0) {
                strongest = suitsOnTheFloor.sort((a1,a2)=>a2-a1)[0];
            }
            else {
                var floorSuit = getSuiteOfCard(cards[0] as PlayingCard);
                strongest = cards.filter(x => getSuiteOfCard(x as PlayingCard) == floorSuit).sort((a1, a2) => a2 - a1)[0];
            }
        }
        return strongest;
    }
}
