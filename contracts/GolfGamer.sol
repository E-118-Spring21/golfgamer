// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.7.6;
//pragma experimental ABIEncoderV2;

contract GolfGamer {

    address payable private owner;
    address payable[] private _players;
    uint256 private _entryFee;
    uint private _numberOfRounds;
    uint private _requiredAttestors = 0;
    uint private _gameCommissionPct = 0;
    address[] _attestors;

    mapping(address => uint) balances;

    //Set the default payouts to 33/33/34 percent each
    uint private _skinsPayoutPerc = 33;
    uint private _ctpPayoutPerc = 33;
    uint private _overallPayoutPerc = 34;

    uint eth2wei = 1000000000000000000;

    struct PlayerLedger {
        uint skins;
        uint ctps;
        uint overallScore;
        uint totalRoundsLogged;
        uint winnings;
    }


    mapping (address => PlayerLedger) scores;

    
    enum GameStatus { OPEN, PENDINGATTEST, CLOSED, CLOSEDPAID }
    GameStatus status = GameStatus.OPEN;

    event LogDeposit(address depositor, uint amount);
    event LogWithdrawl(address receiver, uint amount);

    modifier onlyOwner {
      require(msg.sender == owner);
      _;
    }

    // Contract constructor: set owner
    constructor (address payable[] memory players, 
                uint entryFee, 
                uint requiredAttestors,
                uint gameCommissionPct)  {

        owner = msg.sender;
        
        
        _entryFee = entryFee * eth2wei;
        _requiredAttestors = requiredAttestors;
        _players = players;
        _gameCommissionPct = gameCommissionPct;

        initializeScoreMapping();
        
    }

    function initializeScoreMapping() internal{

        for (uint i = 0; i<_players.length; i++){
            scores[_players[i]] = PlayerLedger(0,0,0,0,0);
        }
    }
    
    //Close the game out.  Don't allow any more scores.  Depending on attestations, set status to either PENDINGATTEST or CLOSED
    function closeGame() external onlyOwner returns (uint) {
        
        if (_requiredAttestors != 0){
            status = GameStatus.PENDINGATTEST;
        } else {
            status = GameStatus.CLOSED;
        }
        
        return (uint(status));
    }
    
    //Attest to the scores.  Return how many more attestations are needed.  If complete, Close the game
    function attestGame() external returns (uint){
        
        uint _remainingAttestations = 0;

        require(status == GameStatus.PENDINGATTEST || status == GameStatus.CLOSED, "The game is not closed and pending attestation");
        
        _attestors.push(msg.sender);
        
        if (_requiredAttestors - _attestors.length >=0){
            _remainingAttestations = _requiredAttestors - _attestors.length;
        }

        if (_remainingAttestations == 0){
            status = GameStatus.CLOSED;
            return 0;
        } else {
            return _remainingAttestations;
        }
        
    }

    function getAttestors() external view returns(address[] memory){
        return _attestors;
    }
    
    //Return current status of the game
    function getStatus() external view returns(uint) {
        
        return (uint(status));
    }

    //Set the  current status of the game - Only owner can do it
    function setStatus(uint newStatus) onlyOwner external returns(uint) {
        
        status = GameStatus(newStatus);
        return (uint(status));
    }
    
    //Set the payout percentage of each game (defaults are 33, 33, 34).  onlyOwner can change
    function setPayouts(uint skinsPayoutPerc, uint ctpPayoutPerc, uint overallPayoutPerc) onlyOwner external{
        
        require((skinsPayoutPerc+ ctpPayoutPerc + overallPayoutPerc ) == 100, "Percentages for payouts must equal 100");

        _skinsPayoutPerc = skinsPayoutPerc;
        _ctpPayoutPerc = ctpPayoutPerc;
        _overallPayoutPerc = overallPayoutPerc;
    }

    function getSkinsPayout() internal view returns(uint){
        return( _skinsPayoutPerc  * _entryFee * _players.length);
    }

    function getCtpPayout() internal view returns(uint){
        return( _ctpPayoutPerc  * _entryFee * _players.length);
    }

    function getOveralPayout() internal view returns(uint){
        return( _overallPayoutPerc  * _entryFee * _players.length);
    }

    //Calculate the payout of each contest based on its percentage of the total pot * the _entryFee
    function getPayouts() external view returns (uint, uint , uint ){
        
        uint skinsVal = getSkinsPayout();
        uint ctpVal = getCtpPayout();
        uint overallVal = getOveralPayout();

        return (skinsVal, ctpVal, overallVal);
    }
    
    //Calculate the current value of each skin won
    function getSkinsValue() public view returns(uint){
        
        uint totalSkins = 0;
        uint value = 0;
        
        //calculate amount per skin based on how many skins logged
        for (uint i = 0; i < _players.length; i++) {  
            totalSkins += scores[_players[i]].skins;
        }
        
        if (totalSkins > 0){
            value = getSkinsPayout() / totalSkins ;
        }

        return (value );
    }
    
    //Calculate the current value of each Closest to the Pin won
    function getCtpValue() public view returns(uint){
        
        uint totalCtp = 0;
        uint value = 0;
        
        //calculate amount per skin based on how many skins logged
        for (uint i = 0; i < _players.length; i++) {  
            totalCtp += scores[_players[i]].ctps;
        }

        if (totalCtp > 0){
            value = getCtpPayout() / totalCtp ;
        }
        
        return (value );
    }
    
    //Return the total payout pot (number of players * entryFee)
    function getTotalPot() external view returns(uint){
        
        return ( _entryFee * _players.length);
    }
    
    //return the list of players
    function getPlayers() external view returns(address payable[] memory){
        return _players;
    }
    
    //post score as either sender or owner
    function postOwnScore(uint skins, uint ctps, uint overallScore)  external {
        postScore(msg.sender, skins, ctps, overallScore);
    }
    
    //only owner can post for another player
    function postScore(address player, uint skins, uint ctps, uint overallScore)  onlyOwner public  {
        
        require(status==GameStatus.OPEN, "The game is no longer open for score entry.");
        
        scores[player].skins += skins;
        scores[player].ctps += ctps;
        scores[player].overallScore += overallScore;
        scores[player].totalRoundsLogged += 1;
        
    }

    function getScore(address player) external view returns(uint, uint, uint, uint, uint){

        PlayerLedger memory playerLedger = scores[player];
        
        return (playerLedger.skins,playerLedger.ctps, playerLedger.overallScore, playerLedger.totalRoundsLogged, getPlayerWinnings(playerLedger)) ;
    }

    function getPlayerWinnings(PlayerLedger memory playerLedger) internal view returns (uint){
        uint skinsVal = getSkinsValue();
        uint ctpVal = getCtpValue();

        return ((playerLedger.ctps * ctpVal/100) + (playerLedger.skins * skinsVal/100));
    }

    function validateBalance(address player) internal view returns (bool){
        return (getBalance(player) >= _entryFee);
    }

    function getBalance(address player) public view returns(uint) {
        return (balances[player]);
    }


    function withdraw() onlyOwner external payable {
        
        uint lowOverall;
        address lowOverallPlayer;

         for (uint i=0;i<_players.length;i++){
            require(validateBalance(_players[i]), "Not all players have funded yet and payouts can not be made");

            scores[_players[i]].winnings = getPlayerWinnings(scores[_players[i]]);
            if (i==0){
                lowOverall = scores[_players[i]].overallScore;
                lowOverallPlayer = _players[i];
            } else if (scores[_players[i]].overallScore < lowOverall){
                lowOverall = scores[_players[i]].overallScore;
                lowOverallPlayer = _players[i];
            }
        }

        scores[lowOverallPlayer].winnings += getOveralPayout()/100;

        
        for (uint i=0;i<_players.length;i++){
           if (scores[_players[i]].winnings > 0){
              payPlayer(_players[i], scores[_players[i]].winnings);
           }
        } 

        //Once all players are paid out, transfer the remaining contract balance to the owner of the contract
        closeContractBalance();

        //Set status to CLOSEDPAID
        status = GameStatus.CLOSEDPAID;
    }

    function payPlayer(address payable wallet, uint value) internal  {
        
        //Subtract the commission from the payout
        if (_gameCommissionPct > 0){
            value = value * (100 - _gameCommissionPct)/100;
        }

        if (address(this).balance > value){
            wallet.transfer(value);  
            emit LogWithdrawl(wallet, value);

        }
    }

    function closeContractBalance() internal {
        
        owner.transfer(address(this).balance);
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit LogDeposit(msg.sender, msg.value);
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    fallback () external {
        revert();
    }

}