const GolfGame = artifacts.require("GolfGamer");

contract("GolfGamer", (accounts) => {
    let golfgame;
    let _entry = 20;
    let numPlayers = 4;
    let players;

    const eth2wei = 1000000000000000000;

    _entry = _entry*eth2wei;

    before(async () => {
        golfgame = await GolfGame.deployed();
    });

    describe("Test all get methods with default constructor values", async () => {
        
        it("1 - Get initial status of game.  Validate OPEN = 0.", async () => {
            const status = await golfgame.getStatus();
            assert.equal(status, 0, "Status should be OPEN (0)");
        });

        it("2 - Get Players.  Initial contract should have 4", async () => {
            players = await golfgame.getPlayers();
            assert.equal(players.length, 4, "There should be 4 players");
        });

        it("3 - Get Skins value.  Initially, should be entry fee / 33", async () => {
            const value = await golfgame.getSkinsValue();
            assert.equal(value, 0, "Value should be 0 with 0 skins won");
        });

        it("4 - Get CTP value.  Initially, should be entry fee / 33", async () => {
            const value = await golfgame.getCtpValue();
            assert.equal(value, 0, "Value should be 0 with 0 ctps won");
        });

        it("5 - Get total pot value. Should equal entry fee in constructor * number of players", async () => {
            const value = await golfgame.getTotalPot();
            console.log("                 Total Pot: " + value);
            assert.equal(value, numPlayers * _entry, "Value should be 80");
        });

        it("6 - Get Payouts value.  All return values are * 100 to account for decimal returns", async () => {

            const value = await golfgame.getPayouts();
            
            let skinVal = parseInt(value[0])/100;
            let ctpVal = parseInt(value[1])/100;
            let overallVal = parseInt(value[2])/100;

            console.log("               Skins : " + skinVal );
            console.log("               CTPs : " + ctpVal);
            console.log("               Overall : " + overallVal);

            assert.equal(skinVal, (_entry * numPlayers * 33/100 ), "6.1 - Value should be 33% of total Entry");
            assert.equal(ctpVal, (_entry *  numPlayers* 33/100), "6.2 - Value should be 33% of total Entry");
            assert.equal(overallVal, (_entry * numPlayers* 34/100), "6.3 - Value should be 34% of total Entry");
        });

    });
    
    describe("Change the percentages of the payout values and test the getPayouts", async () => {
        before("Update percentages", async () => {
          await golfgame.setPayouts(22,23,55);
        });

        it("7 - Get Payouts value.  All return values are * 100 to account for decimal returns", async () => {

            const value = await golfgame.getPayouts();
            
            let skinVal = parseInt(value[0])/100;
            let ctpVal = parseInt(value[1])/100;
            let overallVal = parseInt(value[2])/100;
    
            console.log("               Skins : ", value[0], " : ", skinVal );
            console.log("               CTPs : ", value[1], + ctpVal);
            console.log("               Overall : ", value[2], overallVal);
    
            assert.equal(skinVal, (_entry * numPlayers * 22/100), "7.1 - Value should be 22% of total Entry");
            assert.equal(ctpVal, (_entry *  numPlayers* 23/100), "7.2 - Value should be 23% of total Entry");
            assert.equal(overallVal, (_entry * numPlayers* 55/100), "7.3 - Value should be 55% of total Entry");
        });
    });

    describe("Post some scores and check payouts and game status", async() =>{

        before("Post some scores", async() =>{

            const score1 = ({
                skins: 2,
                ctps:1,
                overall: 87 
            });

            const score2 = ({
                skins: 1,
                ctps:2,
                overall: 90 
            })

            const score3 = ({
                skins: 1,
                ctps:2,
                overall: 90 
            })

            const score4 = ({
                skins: 0,
                ctps:3,
                overall: 95
            })

            const score5 = ({
                skins: 1,
                ctps:0,
                overall: 96
            })

            const score6 = ({
                skins: 0,
                ctps:0,
                overall: 99
            })

            const score7 = ({
                skins: 1,
                ctps:1,
                overall: 94
            })

            const score8 = ({
                skins: 2,
                ctps:1,
                overall: 104
            })

            await golfgame.postScore(players[1], score1.skins, score1.ctps, score1.overall);
            await golfgame.postScore(players[1], score2.skins, score2.ctps, score2.overall);
            await golfgame.postScore(players[2], score3.skins, score3.ctps, score3.overall);
            await golfgame.postScore(players[2], score4.skins, score4.ctps, score4.overall);
            await golfgame.postScore(players[3], score5.skins, score5.ctps, score5.overall);
            await golfgame.postScore(players[0], score6.skins, score6.ctps, score6.overall);
            await golfgame.postScore(players[0], score7.skins, score7.ctps, score7.overall);
            await golfgame.postScore(players[3], score8.skins, score8.ctps, score8.overall);

        });

        let skinVal;
        let ctpVal;
        let overallVal;
        let totalSkins = 0;
        let totalCTPs = 0;

        it("8 - Get Payouts value.  All return values are * 100 to account for decimal returns", async () => {

            const value = await golfgame.getPayouts();
            
            skinVal = value[0];
            ctpVal = value[1];
            overallVal = value[2];

        });

        
        it("9 - Let's get all existing scores", async() => {

            for ( i = 0; i<players.length;i++){
                const value = await golfgame.getScore(players[i]);
                totalSkins += parseInt(value[0]);
                totalCTPs += parseInt(value[1]);
                console.log(`                   Player ${i}: Address: ${players[i]}, Skins: ${value[0]}, CTPS: ${value[1]}, Overall Score: ${value[2]}, Rounds Played: ${value[3]}, Winnings: ${value[4]}`)
            }

        });

        it("10 - Get Skins value.  Should be payout skin value / total skins won", async () => {
            const value = await golfgame.getSkinsValue();
            console.log ("                   Skins Value: " + value/eth2wei/100);
            assert.equal(Math.round(skinVal/totalSkins)/eth2wei/100,value/eth2wei/100, "Value should be skinValue / totalSkins");
        });

        it("11 - Get CTP value.  Initially, should be entry fee / 33", async () => {
            const value = await golfgame.getCtpValue();
            console.log ("                   CTP Value: " + value/eth2wei/100);
            assert.equal( Math.round(ctpVal/totalCTPs)/100/eth2wei,value/eth2wei/100, "Value should be ctpValue / totalctps won");
        });

        describe("Closing game, trying to post more scores (which should fail) and checking statuses", async() =>{

            before("12 - Close game", async () => {
                const status = await golfgame.closeGame();
            });

            it("13 - should pass status assertion with pending as game is just closed.", async () => {
                const status = await golfgame.getStatus();
                //console('This should pass as game is just closed')
                assert.equal(status, 1, "Status should be PENDINGATTEST (1)");
            });

            it("13.5 - going to set the status back to open, then recloseit.", async () => {
                await golfgame.setStatus(0);
                let status = await golfgame.getStatus();

                console.log("      Status: " + status)
                //console('This should pass as game is just closed')
                assert.equal(status, 0, "Status should be OPEN - 0");

                await golfgame.setStatus(1);
                status = await golfgame.getStatus();

                //console('This should pass as game is just closed')
                assert.equal(status, 1, "Status should be PENDING ATTEST - 1");

            });

            it("14 - Attest game - First", async () => {
                const status = await golfgame.attestGame();
            });

            it("15 - should pass status assertion with pending as game is still missing 1.", async () => {
                const status = await golfgame.getStatus();
                assert.equal(status, 2, "Status should be CLOSED (1)");
            });

           
            
        });
    });


    describe("Time to test withdrawls and deposits", async() =>{

        it("16 - Test withdrawl before making any deposits.  Should fail", async() =>{
            
            try{
                await golfgame.withdraw(); 
                assert.fail('Test Failed by allowing payment');
            }  catch(err){
                if (err.message.includes("Not all players have funded yet and payouts can not be made")){
                    console.log('        TEST 16 worked as the error message thrown is correct');
                    assert.equal(1,1);
                } else{
                    assert.fail(err.message);
                }
            } 

        });

        it('17 - should allow deposits by the players.  Deposits should equal the entry fee', async() => {

            golfgame.deposit({from: players[1], value: _entry});
            golfgame.deposit({from: players[2], value: _entry});
            golfgame.deposit({from: players[3], value: _entry});
            golfgame.deposit({from: players[0], value: _entry});
            
        });

        it('18 - should shoudl show a contract balance of players * entry fee', async() => {

            const balance = await golfgame.getContractBalance();
            console.log('          Balance: ' + balance/eth2wei);
            assert (balance/eth2wei, _entry * players.length /eth2wei, "Balance doesn't equal total players times entry");
            
        });

        it("19 - Check balances before withdrawl ", async() =>{
            
            it("19 - Let's get all existing scores", async() => {

                for ( i = 0; i<players.length;i++){
                    const value = await golfgame.getScore(players[i]);
                    totalSkins += parseInt(value[0]);
                    totalCTPs += parseInt(value[1]);
                    console.log(`                   Player ${i}: Address: ${players[i]}, Skins: ${value[0]}, CTPS: ${value[1]}, Overall Score: ${value[2]}, Rounds Played: ${value[3]}, Winnings: ${value[4]}`)
                }
    
            });

        });

        it("20 - Test withdrawl ", async() =>{
            
            await golfgame.withdraw(); 

        });

        it('21 - should should show a contract balance of 0', async() => {

            const balance = await golfgame.getContractBalance();
            console.log('          Balance: ' + balance/eth2wei);
          // assert (0, balance, "Balance of the contract should be zero'd out");
            
        });
    });

});