package com.gustavofantato.blackjack.controller;

import com.gustavofantato.blackjack.strategy.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/game")
public class GameController {

    private final PlayerStrategy botStrategy;

    @Autowired // Auto-injects the conservative strategy
    public GameController(PlayerStrategy botStrategy){
        this.botStrategy = botStrategy;
    }

    @GetMapping("/status")
    public String getGameStatus(){
    return "Server is running! Strategy injected by Spring: "
        + botStrategy.getClass().getSimpleName();
    }

}
