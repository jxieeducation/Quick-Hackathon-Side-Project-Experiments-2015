package com.investfly.api.samples;


import com.strategyard.backend.service.UserService;
import com.strategyard.common.util.InvestflyClient;


public class StrategiesExecutor {
    public static final String API_URL = "https://api.investfly.com/";
    
    // PUT YOUR USERNAME
    public static final String USER_NAME = "jxieeducation";
    
    // PUT YOUR PASSWORD
    public static final String PASSWORD = "apple123";
    
    
    public static void main(String[] argv) {

        // Create client
        System.out.println("Creating client");
        InvestflyClient client    =   new InvestflyClient(API_URL);
        UserService userService     =   client.getUserService();
        
        // Login to strategyard
        System.out.println("Loggin in with username = " + USER_NAME + " and password = " + PASSWORD);
        userService.login(USER_NAME, PASSWORD);

        // Run your strategies
        try {
            System.out.println("---------- Starting MovingAverageCrossover strategy -------");
            new MovingAverageCrossOver().run(client);
            System.out.println("-------- Finished running strategy MovingAverageCrossover -------\n\n");
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            System.out.println("------ Starting Contrarian strategy --------");
            new Contrarian().run(client);
            System.out.println("-------- Finished running strategy Contrarian --------\n\n");
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Logout
        System.out.println("Logging out");
        userService.logout();

    }
}
