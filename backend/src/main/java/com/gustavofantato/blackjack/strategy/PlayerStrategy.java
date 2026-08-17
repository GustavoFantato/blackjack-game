package com.gustavofantato.blackjack.strategy;

import com.gustavofantato.blackjack.model.Deck;
import com.gustavofantato.blackjack.model.Hand;

public interface PlayerStrategy {
    /**
     * Decides if the player should hit or stand
     * @param hand: player's hand
     * @param deck: the game's deck (necessary to the cheat mode)
     * @return true: the player wants to hit / false: the player stand
     */

    boolean shouldHit(Hand hand, Deck deck);
    String getName();
}
