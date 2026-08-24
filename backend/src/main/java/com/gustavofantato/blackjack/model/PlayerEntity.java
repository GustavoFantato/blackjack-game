package com.gustavofantato.blackjack.model;

import jakarta.persistence.*;


@Entity
@Table(name="players")
public class PlayerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto-incrementing
    private Long Id;

    @Column(nullable = false, unique = true, length = 50)
    private String nickname;

    @Column(nullable = false)
    private Double balance = 1000.0; // standard value

    public PlayerEntity(){}

    public PlayerEntity(String nickname){
        this.nickname = nickname;
    }

    // Getters and Setters

    public Long getId() {
        return Id;
    }
    public String getNickname() {
        return nickname;
    }
    public Double getBalance() {
        return balance;
    }
    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
    public void setBalance(Double balance) {
        this.balance = balance;
    }
}
