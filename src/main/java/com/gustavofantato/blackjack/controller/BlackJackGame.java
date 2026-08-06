package com.gustavofantato.blackjack.controller;

import com.gustavofantato.blackjack.model.*;
import com.gustavofantato.blackjack.strategy.*;

public class BlackJackGame {

    // Attributes
    private final Deck deck;
    private final Player player;
    private final Player bot;

    // Constructor
    public BlackJackGame(Player player, Player bot) {
        this.player = player;
        this.bot = bot;
        this.deck = new Deck();
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

        // 4. Bot receives second card (face down / hidden)
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
            delay(3500);
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

    public String determineWinner() {
        int playerScore = player.getHand().calculateScore();
        int botScore = bot.getHand().calculateScore();

        if (playerScore > 21) {
            return "Dealer wins! You busted with " + playerScore + " points.";
        }
        if (botScore > 21) {
            return "Player wins! Dealer busted with " + botScore + " points.";
        }
        if (playerScore > botScore) {
            return "Player wins! (" + playerScore + " vs " + botScore + ")";
        }
        if (botScore > playerScore) {
            return "Dealer wins! (" + botScore + " vs " + playerScore + ")";
        }
        return "It's a tie! (" + playerScore + " pts)";
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