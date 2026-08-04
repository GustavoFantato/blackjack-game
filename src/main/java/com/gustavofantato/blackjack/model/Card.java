package com.gustavofantato.blackjack.model;

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
        return rank + " of " + suit; // when print: "KING of SPADES"
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
