package com.gustavofantato.blackjack.util;

import java.text.NumberFormat;
import java.util.Currency;
import java.util.Locale;

public class CurrencyFormatter {

    private CurrencyFormatter(){}

    public static String formatUSD(double amount){
        NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.US);
        return formatter.format(amount);
    }

    public static String formatBRL(double amount){
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
        return formatter.format(amount);
    }
}
