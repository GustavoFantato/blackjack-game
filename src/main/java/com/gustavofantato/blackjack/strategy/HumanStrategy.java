package com.gustavofantato.blackjack.strategy;

import com.gustavofantato.blackjack.model.Deck;
import com.gustavofantato.blackjack.model.Hand;

import java.util.Scanner;

/** MODE [1]: HUMAN
 * Non-AI player, normal mode
 * The user decides by itself if hits [H] or stand [S]
**/

public class HumanStrategy implements PlayerStrategy{
    private final Scanner scanner = new Scanner(System.in);

    @Override
    public boolean shouldHit(Hand hand, Deck deck) {
        System.out.println("Current Score: " + hand.calculateScore());
        System.out.print("HIT or PASS? (H/P): ");
        String response = scanner.nextLine().trim().toLowerCase();
        return response.equals("h");
    }
}

