package com.gustavofantato.blackjack.strategy;

import com.gustavofantato.blackjack.model.Deck;
import com.gustavofantato.blackjack.model.Hand;
import org.springframework.stereotype.Component;


/** MODE [3]: CONSERVATIVE
 * AI MODE
 * The AI still hit [H] until the score is < 18
 **/

@Component("aggressiveStrategy")
public class AggressiveStrategy implements PlayerStrategy{

    @Override
    public boolean shouldHit(Hand hand, Deck deck){
        return (hand.calculateScore() < 18);
    }

    @Override
    public String getName() {
        return "Aggressive";
    }

}
