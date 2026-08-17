package com.gustavofantato.blackjack.service;
import com.gustavofantato.blackjack.controller.BlackJackGame;
import com.gustavofantato.blackjack.model.*;
import com.gustavofantato.blackjack.strategy.HumanStrategy;
import com.gustavofantato.blackjack.strategy.PlayerStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service // Registers the class as a service managed by the Spring
public class GameService {

    private final Map<String, PlayerStrategy> strategiesMap;

    private Player player;
    private Player dealer;
    private BlackJackGame game;

    @Autowired
    public GameService(Map<String, PlayerStrategy> strategiesMap){
        this.strategiesMap = strategiesMap;
    }

    // When the game starts or player press "Play again" button
    public void startNewRound(String playerName, String strategyChoice, double betAmount){

        // 1. No player created (game has just started)
        // 2. If play again, it just ignores and continues being the same player and wallet
        if (this.player == null){
            this.player = new Player(playerName, new HumanStrategy());
        } else {
            this.player.clearHand();
        }

        // Creating the dealer
        PlayerStrategy botStrategy = resolveStrategy(strategyChoice);
        this.dealer = new Player("Dealer", botStrategy);

        this.game = new BlackJackGame(player, dealer);

        this.game.newPlayerBet(betAmount);
        this.game.startRound();
    }

    public void playerHit(){
        validateGameInProgress();

        if (!game.isBust(player) && !game.hasBlackjack(player)){
            game.hit(player);
        }
    }

    public void playerStand(){
        validateGameInProgress();

        if(!game.isBust(player)){
            game.stand();
        }

        // Determines the winner and adjust the player's wallet
        game.determineWinner();
    }


    private void validateGameInProgress() {
        if (this.game == null){
            throw new IllegalStateException("No game in progress. Please start a new round first!");
        }
    }

    private PlayerStrategy resolveStrategy(String choice){

        String beanName = switch(choice){
            case "1" -> "conservativeStrategy";
            case "2" -> "aggressiveStrategy";
            case "3" -> "cheaterStrategy";
            default -> "conservativeStrategy";
        };

        return strategiesMap.getOrDefault(beanName, strategiesMap.get("conservativeStrategy"));
    }

    // Getters


    public Player getDealer() {
        return dealer;
    }

    public Player getPlayer() {
        return player;
    }

    public BlackJackGame getGame() {
        return game;
    }
}
