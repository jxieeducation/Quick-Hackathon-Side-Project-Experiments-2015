package com.investfly.api.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.strategyard.backend.model.PortfolioStock;
import com.strategyard.backend.model.Portfolio;
import com.strategyard.backend.model.PortfolioSpec;
import com.strategyard.backend.service.StrategyService;
import com.strategyard.backend.service.UserService;
import com.strategyard.common.util.InvestflyClient;
import com.strategyard.common.util.RestUtil;
import com.strategyard.commons.exception.StrategyardException;
import com.strategyard.commons.model.StockMarketType;
import com.strategyard.stockmarket.model.Quote;
import com.strategyard.stockmarket.service.MarketDataService;

public class Contrarian {
    // REPLACE THIS WITH YOUR STRATEGY NAME
    private static final String STRATEGY_NAME = "Contrarian";

   
    public void run(InvestflyClient client) throws Exception {

        // Step 1: Get your strategy and your portfolio
        UserService userService = client.getUserService();
        StrategyService strategyService = client.getStrategyService();
        
        Portfolio strategy = null;
        try {
            strategy = strategyService.getStrategy(StrategiesExecutor.USER_NAME, STRATEGY_NAME);
        } catch (StrategyardException e) {
            if(e.getMessage().contains("Cannot find")){
                PortfolioSpec spec = new PortfolioSpec();
                spec.setStartingCapital(100000.0);
                spec.setMarket(StockMarketType.US);
                spec.setName(STRATEGY_NAME);
                spec.setVisible(true);
                strategy = strategyService.createNewStrategy(spec);
            }
        }

        List<PortfolioStock> openPositions = strategyService.getPortfolioStocks(strategy.getId());

        MarketDataService market = client.getMarketDataService();

        // Step 2: Evaluate your sell condition
        // Always evaluate sell condition before you buy because once you sell,
        // you will have more cash balance to buy

        System.out.println("Checking for any open positions to close");
        for (PortfolioStock openPosition : openPositions) {
            System.out.println("Found open position for " + openPosition.getTicker());
            // This strategy sells the next day after it is bought. Buy you can
            // have sell condition on price or time
            strategyService.doSell(strategy.getId(), openPosition.getTicker());
        }

        // Step 3: Evaluate BUY condition and buy
        // This strategy uses http://finance.yahoo.com/losers?e=us and buys all
        // stocks with drop > 20% and volume > 1 million
        System.out.println("Finished with closing position, Now proceeding to BUY phase");

        List<String> buyTickers = getBuySymbols();

        // get strategy again for new cash balance
        strategy = strategyService.getStrategy(strategy.getId());

        double buyingPower = strategy.getBuyingPower();
        double amountForTicker = buyingPower / buyTickers.size();

        for (String ticker : buyTickers) {
            try {
                System.out.println("Buying " + ticker);
                // Get current quote
                Quote quote = market.getQuote(ticker, strategy.getMarket(), true);

                // Divide amount by quote to find quantity of shares that can be
                // bought
                int quantityToBuy = (int) (amountForTicker / quote.getLastPrice());
                strategyService.doBuy(strategy.getId(), ticker, quantityToBuy);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }


    /**
     * 
     * @return The list of tickers to buy based on Yahoo Finance Percent losers
     *         page. This method returns those stocks whose price have declined
     *         more than 20% and whose volume is more than 1 million
     */
    private static List<String> getBuySymbols() {
        System.out
                .println("Checking for buying symbols. Will put in buy list if percent change > 20% and volume > 1 million");
        List<String> results = new ArrayList<String>();
        try {
            // Get page html
            RestUtil rest = new RestUtil("");
            String url = "http://finance.yahoo.com/_remote/?m_id=MediaRemoteInstance&instance_id=85ac7b2b-640f-323f-a1c1-00b2f4865d18&mode=xhr&ctab=tab3&nolz=1&count=50&start=0&category=percentagelosers&no_tabs=1";

            String pageHtml = rest.get(url, String.class);

            // Extract percent losers table html from the page
            String tableHtml = pageHtml.substring(pageHtml.indexOf("1-Day"),
                    pageHtml.indexOf("</table>", pageHtml.indexOf("1-Day")));

            tableHtml = tableHtml.replaceAll("[\n\r]*", "");

            // Extract rows from the table
            Pattern p = Pattern.compile("<tr>.*?</tr>");
            Matcher m = p.matcher(tableHtml);

            while (m.find()) {
                // For each table row
                String row = m.group();

                // Extract symbol
                String symbol = row.substring(row.indexOf("q?s=") + 4, row.indexOf("\"", row.indexOf("q?s=")));

                // Extract percent down
                int percentBegin = row.indexOf(">", row.indexOf("pp0"));
                int percentEnd = row.indexOf("%", percentBegin);
                String percentDown = row.substring(percentBegin + 1, percentEnd);
                Double percentDownNbr = getNumber(percentDown);

                // Extract volume
                int volumeBegin = row.indexOf(">", row.indexOf("v53"));
                int volumeEnd = row.indexOf("<", volumeBegin);
                String volume = row.substring(volumeBegin + 1, volumeEnd);

                Double volumeNbr = getNumber(volume);
                // If percent down > 20 and volume greater than 1 million, then
                // add
                // to the list
                System.out
                        .println("Symbol=" + symbol + "\t percent change=" + percentDownNbr + "\tvolume=" + volumeNbr);
                if (percentDownNbr > 20 && volumeNbr > 1000000) {
                    results.add(symbol);
                }

            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return results;

    }

    private static Double getNumber(String str) {
        // tries to convert string to number, replacing M = 100000
        Double value = -999.99;
        long multiplier = 1;
        try {
            str = str.replaceAll("\\s", ""); // remove whitespace
            str = str.replaceAll("%", "");
            str = str.replaceAll(",", "");
            if (str.contains("M")) {
                str = str.replaceAll("M", "");
                multiplier = 1000000;
            } else if (str.contains("B")) {
                str = str.replaceAll("B", "");
                multiplier = 1000000000;
            } else if (str.contains("K")) {// i simply added the multiplier for
                                           // 'K', i don't think it will effect
                                           // other programs output, if it does,
                                           // do let me know
                str = str.replaceAll("K", "");
                multiplier = 1000;
            }

            value = Double.valueOf(str);
            value = value * multiplier;

        } catch (Exception e) {
            return Double.NaN;
        }
        return value;
    }

    public PortfolioSpec getSpec() {
        PortfolioSpec spec = new PortfolioSpec();
        spec.setDescription("This is a cotrarian strategy");
        spec.setMarket(StockMarketType.US);
        spec.setName(STRATEGY_NAME);
        spec.setStartingCapital(10000d);
        spec.setVisible(false);

        return spec;
    }
}
