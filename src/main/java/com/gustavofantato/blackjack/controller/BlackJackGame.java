package com.gustavofantato.blackjack.controller;

import com.gustavofantato.blackjack.model.*;
import com.gustavofantato.blackjack.strategy.*;

public class BlackJackGame {

    // Attributes
    private final Deck deck;
    private final Player player;
    private final Player bot;

    // Constructor
    public BlackJackGame(Player player, Player bot){
        this.player = player;
        this.bot = bot;
        this.deck = new Deck();
    }

    // Methods
    public void startRound(){

        deck.resetDeck(); // to reset and shuffle the deck

        // 1. Player buys (visible)
        player.receiveCard(deck.drawCard());

        // 2. Bot buys (visible)
        bot.receiveCard(deck.drawCard());

        // 3. Player buys (visible)
        player.receiveCard(deck.drawCard());

        // 4. Bot buys (not visible)
        Card hiddenCard = deck.drawCard();
        hiddenCard.setFaceUp(false);
        bot.receiveCard(hiddenCard);

        System.out.println("Player's hand: " + player.getHand());
        System.out.println("Dealers's hand: " + bot.getHand());
    }

    public static void main(String[] arg){

        Player player = new Player("Gustavo", new HumanStrategy());
        Player bot = new Player("Dealer", new ConservativeStrategy());

        BlackJackGame game = new BlackJackGame(player, bot);

        game.startRound();

        boolean playerStand = false;
        boolean botStand = false;

        while(!playerStand && !botStand){
            playerStand = player.wantsToHit(game.deck);
            botStand = bot.wantsToHit(game.deck);
        }
    }

}



