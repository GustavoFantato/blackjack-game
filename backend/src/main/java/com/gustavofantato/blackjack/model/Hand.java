package com.gustavofantato.blackjack.model;

import java.util.ArrayList;
import java.util.List;

public class Hand {

    // Attributes
    private final List<Card> cards;

    // Constructor
    public Hand() {
        this.cards = new ArrayList<>();
    }

    // Adds a new card to the hand
    public void addNewCard(Card newCard) {
        cards.add(newCard);
    }

    // Resets the hand for a new round
    public void resetHand() {
        this.cards.clear();
    }

    // Calculates and returns the score
    public int calculateScore() {
        int total = 0;
        int aceCount = 0;

        for (Card card : cards) {
            total += card.getRank().getValue();
            if (card.getRank() == Rank.ACE) {
                aceCount++;
            }
        }

        // Adjusts Aces from 11 to 1 (-10 points) if the total exceeds 21
        while (total > 21 && aceCount > 0) {
            total -= 10;
            aceCount--;
        }

        return total;
    }

    @Override
    public String toString() {
        return String.valueOf(cards);
    }

    // Getters
    public List<Card> getCards() {
        return cards;
    }

    public Card getHiddenCard() {
        for (Card card : cards) {
            if (!card.isFaceUp()) {
                return card; // returns the first hidden card
            }
        }
        return null;
    }
}