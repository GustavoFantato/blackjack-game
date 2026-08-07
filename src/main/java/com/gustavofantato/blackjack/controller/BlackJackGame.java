package com.gustavofantato.blackjack.controller;

import com.gustavofantato.blackjack.model.*;
import com.gustavofantato.blackjack.strategy.*;
import com.gustavofantato.blackjack.util.CurrencyFormatter;

import java.util.Formatter;

public class BlackJackGame {

    // Attributes
    private final Deck deck;
    private final Player player;
    private final Player bot;
    private double currentBet;
    private final double winMultiplier;
    private final double blackjackMultiplier;

    // Constructor
    public BlackJackGame(Player player, Player bot) {
        this.player = player;
        this.bot = bot;
        this.deck = new Deck();
        this.winMultiplier = 2.0;
        this.blackjackMultiplier = 2.5;
    }

    // Methods

    public void startRound() {
        deck.resetDeck(); // Resets and shuffles the deck
        player.getHand().resetHand();
        bot.getHand().resetHand();

        // 1. Player receives first card (visible)
        player.receiveCard(deck.drawCard());

        // 2. Bot receives first card (visible)
        bot.receiveCard(deck.drawCard());

        // 3. Player receives second card (visible)
        player.receiveCard(deck.drawCard());

        // 4. Bot receives the second card (face down / hidden)
        Card hiddenCard = deck.drawCard();
        hiddenCard.setFaceUp(false);
        bot.receiveCard(hiddenCard);

        System.out.println(player.getName() + "'s hand: " + player.getHand());
        System.out.println("Dealer's hand: " + bot.getHand());

        System.out.println("--- " + player.getName() + "'s turn! ---");
    }

    public void hit(Player p) {
        Card card = deck.drawCard();
        p.receiveCard(card);
        System.out.println(p.getName() + "'s hand: " + p.getHand());
        delay(2000);
    }

    public void stand() {
        System.out.println("\n--- Dealer's Turn ---");
        revealDealerCards(bot);
        System.out.println("Dealer reveals hidden card: " + bot.getHand());
        delay(5000);
        playDealerTurn();
    }

    public void revealDealerCards(Player dealer) {
        Card hiddenCard = dealer.getHand().getHiddenCard();
        if (hiddenCard != null) {
            hiddenCard.setFaceUp(true);
        }
    }

    public void playDealerTurn() {

        if(hasBlackjack(bot)){
            System.out.println("The dealer has got a BlackJack!");
            delay(1000);
        }

        while (bot.wantsToHit(deck)) {
            System.out.println("The dealer hits...");
            hit(bot);
            delay(1500);
        }
        System.out.println("Dealer stands.");
        delay(1000);
    }

    public boolean isBust(Player p) {
        return p.getHand().calculateScore() > 21;
    }

    public boolean hasBlackjack(Player p) {
        return p.getHand().calculateScore() == 21 && p.getHand().getCards().size() == 2;
    }

    public boolean newPlayerBet(double quantity){
        boolean success = player.getWallet().removeCash(quantity);
        currentBet = quantity;

        if(success){
            System.out.println("Bet placed successfully! Current bet: " + CurrencyFormatter.formatUSD(quantity));
            return true;
        }

        System.out.println("Not enough cash in wallet to this bet!");
        return false;
    }

    public void playerWins(){

        double receiveAmount;
        double multiplier;

        // If the player wins with a blackjack, the multiplier is different from a common win
        if (hasBlackjack(player)){
            receiveAmount = blackjackMultiplier * currentBet;
            multiplier = blackjackMultiplier;
        } else{
            receiveAmount = winMultiplier * currentBet;
            multiplier = winMultiplier;
        }

        player.getWallet().addCash((receiveAmount)); // Adds the amount
        System.out.println("Added " +  CurrencyFormatter.formatUSD(receiveAmount) + " to " + player.getName() + " ("
            + multiplier + ("x multiplier)"));
        delay(300);
        player.printWallet();
        delay(300);
    }

    public void playerLose(){
        System.out.println(player.getName() + " lost the bet of " + CurrencyFormatter.formatUSD(currentBet) + ".");
        delay(300);
        player.printWallet();
        delay(300);
    }

    public void draw(){
        player.getWallet().addCash((currentBet)); // Adds the amount
        System.out.println(player.getName() + " received back " + CurrencyFormatter.formatUSD(currentBet) + " from the draw.");
        player.printWallet();
        delay(300);
    }

    public void determineWinner() {
        int playerScore = player.getHand().calculateScore();
        int botScore = bot.getHand().calculateScore();

        if (playerScore > 21) {
            System.out.println("Dealer wins! You busted with " + playerScore + " points.");
            playerLose();
            return;
        }
        if (botScore > 21) {
            System.out.println("Player wins! Dealer busted with " + botScore + " points.");
            playerWins();
            return;
        }
        if (playerScore > botScore) {
            System.out.println("Player wins! (" + playerScore + " vs " + botScore + ")");
            playerWins();
            return;
        }
        if (botScore > playerScore) {
            System.out.println("Dealer wins! (" + botScore + " vs " + playerScore + ")");
            playerLose();
            return;
        }

        System.out.println("It's a tie! (" + playerScore + " pts)");
        draw();
    }

    // Better console read
    private void delay(int milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    // Getters
    public Deck getDeck() { return deck; }
    public Player getPlayer() { return player; }
    public Player getBot() { return bot; }
}