package com.gustavofantato.blackjack.strategy;

import com.gustavofantato.blackjack.model.Deck;
import com.gustavofantato.blackjack.model.Hand;

/** MODE [2]: CONSERVATIVE
 * AI MODE
 * The AI passes [P] if the current score is 15>=
 **/

public class ConservativeStrategy implements PlayerStrategy{

    @Override
    public boolean shouldHit(Hand hand, Deck deck) {
        return (hand.calculateScore() < 15);
    }
}
