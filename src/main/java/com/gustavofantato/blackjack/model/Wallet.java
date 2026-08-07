package com.gustavofantato.blackjack.model;

public class Wallet {

    // Attributes
    private double cash;

    // Constructor
    public Wallet(){
        this.cash = 1000.00;
    }
    public Wallet(double initialCash){
        this.cash = Math.max(0, initialCash);
    }

    // Methods

    public void addCash(double quantity){

        if (quantity <= 0){
            System.out.println("Invalid quantity! It must be a positive value.");
            return;
        }

        this.cash += quantity;
    }

    public boolean removeCash(double quantity){

        if(quantity <= 0){
            System.out.println("Invalid quantity! It must be a positive value.");
            return false;
        }

        if(!hasEnough(quantity)){
            System.out.println("No enough cash on wallet!");
            return false;
        }

        this.cash -= quantity;
        return true;
    }


    public boolean hasEnough(double quantity) {
        return this.cash >= quantity;
    }

    public boolean isEmpty(){
        return (this.cash <= 0);
    }


    // Getters
    public double getCash() {
        return cash;
    }
}
