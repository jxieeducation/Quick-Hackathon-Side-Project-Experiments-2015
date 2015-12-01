package com.investfly.api.samples;

import java.util.List;

import com.strategyard.backend.model.PortfolioStock;
import com.strategyard.backend.model.Portfolio;
import com.strategyard.backend.model.PortfolioSpec;
import com.strategyard.backend.service.StrategyService;
import com.strategyard.backend.service.UserService;
import com.strategyard.common.util.InvestflyClient;
import com.strategyard.commons.exception.StrategyardException;
import com.strategyard.commons.model.StockMarketType;
import com.strategyard.stockmarket.service.MarketDataService;

public class MovingAverageCrossOver {

    // REPLACE THIS WITH YOUR STRATEGY NAME
    private static final String STRATEGY_NAME = "MovingAverageCrossOver";

    private String[] financeStocks = new String[] { "BAC", "C", "JPM", "UBS", "MS", "AIG" };

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
            // For each open position in your portfolio, decide if you need to
            // sell
            // and close the position

            // We sell if 20 day moving average crossed UNDER 50 day moving
            // average
            // Get historical quotes for 50 working days = 10 weeks = 70 actual
            // days
            double[] historicalPrices = market.getHistoricalSeries(openPosition.getTicker(), strategy.getMarket(), 70, MarketDataService.SERIES_CLOSE);
            double avg20 = computeAverage(historicalPrices, 20);
            double avg50 = computeAverage(historicalPrices, 50);
            System.out.println("20 day moving average = " + avg20 + ", 50 day moving average = " + avg50);

            boolean toSell = avg20 < avg50;

            if (toSell) {
                // send the sell order
                System.out.println("Selling " + openPosition.getTicker());
                strategyService.doSell(strategy.getId(), openPosition.getTicker());
            }

        }

        // Step 3: Evaluate BUY condition and buy
        System.out.println("Finished with closing position, Now proceeding to BUY phase");
        for (String ticker : financeStocks) {
            System.out.println("Processing ticker " + ticker);

            // We buy if 20 day moving average crossed above 50 day moving
            // average
            double[] historicalPrices = market.getHistoricalSeries(ticker, strategy.getMarket(), 70, MarketDataService.SERIES_CLOSE);
            double avg20 = computeAverage(historicalPrices, 20);
            double avg50 = computeAverage(historicalPrices, 50);
            System.out.println("20 day moving average = " + avg20 + ", 50 day moving average = " + avg50);

            boolean toBuy = avg20 > avg50;
            if (toBuy) {
                System.out.println("Buying " + ticker);
                strategyService.doBuy(strategy.getId(), ticker, 100);
            } else {
                System.out.println("Not buying because 20-day moving average is smaller than 50 day moving average");
            }
        }

    }


    private static double computeAverage(double[] list, int numberOfDays) {
        double sum = 0;
        int i;
        for (i = 0; i < list.length && i < numberOfDays; i++) {
            sum += list[i];
        }
        return sum / i;
    }

    public PortfolioSpec getSpec() {
        PortfolioSpec spec = new PortfolioSpec();
        spec.setDescription("This is a testing strategy");
        spec.setMarket(StockMarketType.US);
        spec.setName(STRATEGY_NAME);
        spec.setStartingCapital(1000000d);
        spec.setVisible(false);

        return spec;
    }
}
