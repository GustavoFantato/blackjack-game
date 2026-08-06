package com.gustavofantato.blackjack;

import com.gustavofantato.blackjack.controller.BlackJackGame;
import com.gustavofantato.blackjack.model.Player;
import com.gustavofantato.blackjack.strategy.*;

import java.util.Scanner;

public class Main {
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);

        // Player initialization
        // Get the player's name and define the HumanStrategy
        System.out.print("-= WELCOME TO BLACKJACK GAME! =-\n");
        System.out.print("Please, enter your name: \n");
        String playerName = scanner.nextLine().trim();

        System.out.println("Welcome, " + playerName + "! Have a nice game!\n");

        PlayerStrategy playerStrategy = new HumanStrategy();
        Player p = new Player(playerName, playerStrategy);

        boolean playAgain = true;

        while(playAgain){
            // Bot initialization
            // The player may choose the opponent's strategy
            System.out.print("Choose which dealer's strategy you want to play against:\n");
            System.out.println("1. Conservative (dealer stops at 15 or higher)");
            System.out.println("2. Aggressive (dealer stops at 18 or higher)");
            System.out.println("3. Cheater (dealer can see the deck's next card)");

            PlayerStrategy botStrategy;

            String input = scanner.nextLine().trim();

            botStrategy = switch (input) {
                case "1" -> new ConservativeStrategy();
                case "2" -> new AggressiveStrategy();
                case "3" -> new CheaterStrategy();
                default -> {
                    System.out.println("Invalid choice. Defaulting to Conservative strategy.");
                    yield new ConservativeStrategy();
                }
            };

            Player bot = new Player("Dealer", botStrategy);

            // Starting the game
            BlackJackGame game = new BlackJackGame(p, bot);

            game.startRound();

            if (game.hasBlackjack(p)) {
                System.out.println(p.getName() + " got a blackjack! Automatic standing...");
            } else {
                while (true){

                    // Verify if player has got a blackjack
                    if (game.hasBlackjack(p)){
                        System.out.println(p.getName() + " got a blackjack! Automatic standing...");
                        break;
                    }

                    // Verify if player has burst
                    if (game.isBust(p)){
                        System.out.println("You have burst! Automatic standing...");
                        break;
                    }

                    // Verify if player wants to hit
                    if(p.wantsToHit(game.getDeck())){
                        game.hit(p);
                    } else {
                        break;
                    }
                }
            }

            if (!game.isBust(p)) {
                // Player stands and starts dealer's turn
                game.stand();
            }

            System.out.println(game.determineWinner());
            System.out.println("Thanks for playing!");

            while (true) {
                System.out.println("Wants to play again?\n YES [Y] or NO [N]: ");
                input = scanner.nextLine().trim().toLowerCase();

                if (input.equals("y") || input.equals("yes")) {
                    playAgain = true;
                    break;
                } else if (input.equals("n") || input.equals("no")) {
                    playAgain = false;
                    break;
                } else {
                    System.out.println("Invalid option!");
                }
            }
        }

        scanner.close();
    }
}