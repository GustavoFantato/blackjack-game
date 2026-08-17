package com.gustavofantato.blackjack.model;

import static com.gustavofantato.blackjack.model.Rank.*;

public class Card {

    // Attributes
    private final Suit suit;
    private final Rank rank;
    private boolean faceUp;

    // Constructor
    public Card(Suit suit, Rank rank){
        this.suit = suit;
        this.rank = rank;
        this.faceUp = true;
    }

    // Methods

    public boolean isFaceUp() {
        return faceUp;
    }

    @Override
    public String toString() {
        if (!faceUp) {
            return "HIDDEN"; // if faceUp false, doesn't show
        }

        if (getRank() == ACE){
            return rank + " (11/1)" + " of " + suit;
        }

        return rank + " (" + getRank().getValue() + ")" + " of " + suit;
    }

    // Getters
    public Rank getRank() {
        return rank;
    }
    public Suit getSuit() {
        return suit;
    }

    // Setters
    public void setFaceUp(boolean faceUp) {
        this.faceUp = faceUp;
    }
}
