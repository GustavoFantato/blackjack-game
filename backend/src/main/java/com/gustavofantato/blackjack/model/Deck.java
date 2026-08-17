package com.gustavofantato.blackjack.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Deck {

    // Attributes
    private final List<Card> cards; // 52 cards

    // Constructor
    public Deck(){
        this.cards = new ArrayList<>();
        resetDeck();
    }


    // Methods
    // Deck shuffler
    public void shuffle(){
        Collections.shuffle(this.cards);
    }

    // Draw first card
    public Card drawCard(){
        return this.cards.removeFirst();
    }

    // Resets the deck. Adds the 52 cards and shuffles it
    public void resetDeck(){
        this.cards.clear();

        for (Suit suit : Suit.values()){// for each suit
            for(Rank rank: Rank.values()){ // for each rank
                cards.add(new Card(suit, rank)); // adds the new card to the deck
            }
        }

        shuffle();
    }

    // Returns the peek card (cheat mode exclusive)
    public Card peekCard() {
        if (cards.isEmpty()) {
            return null;
        }
        return cards.get(0);
    }


    @Override
    public String toString() {
        return "Deck [cards = " + cards + "]";
    }


    // Getters

    public List<Card> getCards() {
        return cards;
    }


// DEBUG
//    public static void main(String[] args){
//
//        Deck deck = new Deck();
//        System.out.println(deck);
//        Card drawnCard = deck.drawCard();
//
//        System.out.println(drawnCard);
//        System.out.println(deck);
//    }

}
