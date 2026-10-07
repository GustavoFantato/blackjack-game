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
    private final PlayerService playerService;

    private Player player;
    private Player dealer;
    private BlackJackGame game;

    @Autowired
    public GameService(Map<String, PlayerStrategy> strategiesMap, PlayerService playerService){
        this.strategiesMap = strategiesMap;
        this.playerService = playerService;
    }

    // When the game starts or player press "Play again" button
    public void startNewRound(String playerName, String strategyChoice, double betAmount){

        PlayerEntity playerEntity = playerService.getOrCreatePlayer(playerName);

        this.player = new Player(playerName, new HumanStrategy(), playerEntity.getBalance());

        // Creating the dealer
        PlayerStrategy botStrategy = resolveStrategy(strategyChoice);
        this.dealer = new Player("Dealer", botStrategy);

        this.game = new BlackJackGame(player, dealer);
        boolean betSuccessful = this.game.newPlayerBet(betAmount);

        if (!betSuccessful) {
            throw new IllegalArgumentException("Insufficient funds in the bank to place the bet!");
        }

        playerEntity.setBalance(this.player.getWallet().getCash()); // Has already been debited
        playerService.save(playerEntity); // save in the database
        this.game.startRound();
    }

    public void playerHit(){
        validateGameInProgress();

        if (game.isBust(player) || game.hasBlackjack(player) || game.isPlayerStand()){
            throw new IllegalArgumentException("Cannot hit: Round is already finished or player cannot take more cards.");
        }

        game.hit(player);
    }

    public void playerStand(){
        validateGameInProgress();

        if(!game.isBust(player)){
            game.stand();
        }

        // Determines the winner and adjust the player's wallet
        game.determineWinner();
        syncWalletWithDatabase();
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

    private void syncWalletWithDatabase(){
        PlayerEntity playerEntity = playerService.getOrCreatePlayer(player.getName());

        double finalBalance = player.getWallet().getCash();

        playerEntity.setBalance(finalBalance);
        playerService.save(playerEntity);
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