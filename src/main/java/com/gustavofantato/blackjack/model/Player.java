package com.gustavofantato.blackjack.model;

import com.gustavofantato.blackjack.strategy.PlayerStrategy;
import com.gustavofantato.blackjack.util.CurrencyFormatter;

public class Player {

    // Attributes
    private final String name;
    private Hand hand;
    private final PlayerStrategy strategy;
    private Wallet wallet;

    // Constructors
    public Player(String name, PlayerStrategy strategy){
        this.name = name;
        this.strategy = strategy;
        this.hand = new Hand();
        this.wallet = new Wallet();
    }

    public Player(String name, PlayerStrategy strategy, double initialCash){
        this.name = name;
        this.strategy = strategy;
        this.hand = new Hand();
        this.wallet = new Wallet(initialCash);
    }

    // Methods

    // Receives the new card that has been given by the game
    public void receiveCard(Card newCard){
        this.hand.addNewCard(newCard);
    }

    // Verify the strategy to take the decision if hits or not
    public boolean wantsToHit(Deck deck){
        return strategy.shouldHit(hand, deck);
    }

    public void printWallet(){
        System.out.println(getName() + "'s wallet: " + CurrencyFormatter.formatUSD(getWallet().getCash()));
    }

    // Getters
    public Hand getHand() {
        return hand;
    }
    public String getName() {
        return name;
    }
    public Wallet getWallet() {
        return wallet;
    }
}
