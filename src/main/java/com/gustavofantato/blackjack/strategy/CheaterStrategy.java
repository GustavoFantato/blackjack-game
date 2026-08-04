package com.gustavofantato.blackjack.strategy;

import com.gustavofantato.blackjack.model.Deck;
import com.gustavofantato.blackjack.model.Hand;

/** MODE [4]: CHEATER
 * AI MODE
 * The AI is able to see the next deck's card. So it decides if hits [H] or stands [S] based on the card it saw
 **/

public class CheaterStrategy implements PlayerStrategy{

    @Override
    public boolean shouldHit(Hand hand, Deck deck) {
        return (hand.calculateScore() + deck.peekCard().getRank().getValue()) <= 21;
    }
}
