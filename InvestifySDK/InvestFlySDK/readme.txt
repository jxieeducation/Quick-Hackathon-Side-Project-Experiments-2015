InvestFly Client/SDK Readme

Contents:
The ZIP archive contains following folders
lib - Dependent jar libraries. ./lib/investfly-client.jar contains the main InvestFly SDK package. Other jars are depending jars to use REST API.
src - Source code of some examples strategies and utilities
compile.sh and compile.bat - Helper script to compile example strategies source code
run.sh and run.bat - Helper script to compile and run the bat

To run the examples, do the following steps

Step 1 
Open the ./src/com/investfly/api/samples/StrategiesExecutor.java inside examples folder using source editor. 
Replace the following with your username and password that you use to access www.investfly.com.

private static final String USER_NAME = "replace_with_your_username";
private static final String PASSWORD = "replace_with_your_password;
You must have an account with us to use the API. If you do not, you can sign up at www.investfly.com. This is the top level file that will run your strategies.

Step 3 - Strategy definitions
The strategies are implemented in MovingAverageCrossover.java and Contrarian.java. 
These are very basic strategies used for illustration only. Open these files and look over the strategies. 

Step 4 - Compile
Compile everything by running compile.sh (linux) or compile.bat (windows).
You must have javac compiler in your path for the script to work. 
If they are installed but not in your path, edit the compile.sh/compile.bat and supply full path to javac commands. 

Step 5 - Execute
Run you strategies by running run.sh (linux) or run.bat (windows). You must have Java installed and in your path to run this command.
You should see strategy messages getting printed in console window.
Now, log in to www.investfly.com to see what stock your strategy bought. If the market is closed at the time of execution, then they may be in the pending orders list. 

Executing these strategies requires Java to make HTTP web connection to InvestFly. 
If you get SocketConnection Exception or anything like that, make sure that you are not behind corporate firewall.
If you use proxy to access outside network, edit run.sh or run.bat and put in your proxy settings as JVM paramters after java
-Dhttp.proxyHost=10.10.10.10 -Dhttp.proxyPort=8800 

Step 6 - Set up automatic execution of your strategies
You are strongly encouraged to set up automatic execution of your strategies on fixed intervals (every day, every week etc). 
This way, once you write your strategy, you don't have to run them manually.
To set up automatic execution, use Windows Scheduled Task feature or Linux cron job. See following links for details
For setting scheduled task in windows, see http://support.microsoft.com/kb/308569
For setting cronjob in linux, see http://www.cyberciti.biz/faq/how-do-i-add-jobs-to-cron-under-linux-or-unix-oses/ 
