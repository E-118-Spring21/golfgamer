# Golf Gamer
## E-118 Final Project
## Alan Ranciato
&nbsp;
&nbsp;
#
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;   
      
        
          


## Project Description
This project is a golf contest wagering contract to be used for small to large groups.

The contract tracks multiple players, their number of skins and CTPs (closest to the pin) won as well as their total scores for multiple rounds of golf. After requiring a buyin from each player, the contract calculates the pro-rated payout per contest for each player, calculates a commission (to pay for both gas and administration), and provides payouts to the players and the owner of the contract.

Along the way, the contract allows for changing the percentage of payout for each game, the number of score attestations needed to finalize the game, and the ability to see scores and contest standings along the way.

At the end, when the withdraw() function is called, final payouts are calculated (total won - commission), players are all paid, the contract remaining balance is paid to the owner of the contract and events are emited to the blockchain.  

&nbsp;
&nbsp;
&nbsp;
&nbsp; 
  
### Resources
Code: https://github.com/alanranciato/hes-crypto/tree/main/final_project  
Demo Slides: https://docs.google.com/presentation/d/1C0MnaqQhV6dczN8Am4gtnkcpklTEdIPDlOrQiZI-mls/edit?usp=sharing 

&nbsp;
&nbsp;
&nbsp;
&nbsp;

&nbsp;
&nbsp;
&nbsp;
&nbsp;

### References used
* Ethereum course book
* Bank.sol example contract from coursework
* Solidity documentation https://docs.soliditylang.org/en/v0.7.4/ 

&nbsp;
&nbsp;
&nbsp;
&nbsp;

### Project Structure (relevent information)
./  
    ./contracts/ - solidity contracts  
    ./migrations/ - truffle migrations  
    ./test/ - truffle tests  
./GolfGamer.ipynb - jupyter notebook demonstrating solution  
./proposal_ranciato.md - final project proposal  
./README.md (this file)  


&nbsp;
&nbsp;
&nbsp;
&nbsp;

###  Project dependencies
* Install Jupyter / web3 / python3
* Install truffle / ganache
  * be sure npm is installed ```sudo apt-get install npm``` if it's not already installed  
  * ```npm install -g truffle```
  * Install Ganache by downloading the latest version  and running via ```ganache-*.AppImage```


&nbsp;
&nbsp;
&nbsp;
&nbsp;

### Testing Contract Code
* Run ```truffle test```

&nbsp;
&nbsp;
&nbsp;
&nbsp;

### Deploying Contract
* Run Ganache via ```ganache-*.AppImage```
* In the Ganache UI, create a new workspace via QuickStart
* Click the settings button (gear icon), add a project and browse to the truffle-config.js in this repo
* run ```truffle migrate```

&nbsp;
&nbsp;
&nbsp;
&nbsp;

### Working with the contract
* Once the project has been deployed, open ganache and copy the contract's address
* Open the jupyter notebook GolfGamer.ipynb and in the first code block, paste the contract address
* Run through the notebook validating values and transactions in Ganache



