package com.gustavofantato.blackjack.controller;

import com.gustavofantato.blackjack.service.GameService;
import com.gustavofantato.blackjack.strategy.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game") // controller's routes
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {

    private final GameService gameService;

    @Autowired // Auto-injects
    public GameController(GameService gameService){
        this.gameService = gameService;
    }

    // testing POSTs
    // http://localhost:8080/api/game/start?name=Gustavo&strategy=2&bet=50
    @PostMapping("/start")
    public BlackJackGame startRound(@RequestParam String name, @RequestParam(defaultValue = "1") String strategy, @RequestParam double bet){
        gameService.startNewRound(name,strategy,bet);
        return gameService.getGame();
    }

    // http://localhost:8080/api/game/hit
    @PostMapping("/hit")
    public BlackJackGame hit(){
        gameService.playerHit();
        return gameService.getGame();
    }

    // http://localhost:8080/api/game/stand
    @PostMapping("/stand")
    public BlackJackGame stand(){
        gameService.playerStand();
        return gameService.getGame();
    }

    // http://localhost:8080/api/game/status
    @PostMapping("/status")
    public BlackJackGame getStatus(){
        return  gameService.getGame();
    }

}
