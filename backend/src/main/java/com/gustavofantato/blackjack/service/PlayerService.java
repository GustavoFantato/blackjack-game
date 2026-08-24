package com.gustavofantato.blackjack.service;

import com.gustavofantato.blackjack.model.PlayerEntity;
import com.gustavofantato.blackjack.repository.PlayerRepository;
import org.springframework.stereotype.Service;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;

    // Constructor
    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }


    // Methods

    public PlayerEntity getOrCreatePlayer(String nickname){

        String normalizedNickname = nickname.trim().toLowerCase();

        return playerRepository.findByNickname(normalizedNickname)
                .orElseGet(() -> playerRepository.save(new PlayerEntity(normalizedNickname))); // try to find an entity with the nickname.If it doesn't find, add a new user to the table with the standard balance
    }

    // To update the new user's balance
    public PlayerEntity save(PlayerEntity player){
        return playerRepository.save(player);
    }
}
