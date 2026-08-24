package com.gustavofantato.blackjack.repository;

import com.gustavofantato.blackjack.model.PlayerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<PlayerEntity, Long> {
    Optional<PlayerEntity> findByNickname(String nickname);
}