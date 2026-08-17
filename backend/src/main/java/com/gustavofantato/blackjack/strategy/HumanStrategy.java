package com.gustavofantato.blackjack.strategy;

import com.gustavofantato.blackjack.model.Deck;
import com.gustavofantato.blackjack.model.Hand;
import org.springframework.stereotype.Component;

import java.util.Scanner;

/** MODE [1]: HUMAN
 * Non-AI player, normal mode
 * The user decides by itself if hits [H] or stand [S]
**/

@Component("humanStrategy")
public class HumanStrategy implements PlayerStrategy{

    @Override
    public boolean shouldHit(Hand hand, Deck deck) {
        return false;
    }

    @Override
    public String getName() {
        return "Human";
    }
}

