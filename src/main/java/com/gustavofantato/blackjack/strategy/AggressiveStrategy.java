package com.gustavofantato.blackjack.strategy;

import com.gustavofantato.blackjack.model.Deck;
import com.gustavofantato.blackjack.model.Hand;


/** MODE [3]: CONSERVATIVE
 * AI MODE
 * The AI still hit [H] until the score is < 18
 **/

public class AggressiveStrategy implements PlayerStrategy{

    @Override
    public boolean shouldHit(Hand hand, Deck deck){
        return (hand.calculateScore() < 18);
    }

}
