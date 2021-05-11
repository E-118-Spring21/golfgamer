var GolfGame= artifacts.require("GolfGamer");

module.exports = function(deployer,network, accounts) {

    const player1 = accounts[1];
    const player2 = accounts[2];
    const player3 = accounts[3];
    const player4 = accounts[4];

    const players = [player1, player2, player3, player4];

    const entryFee = 20;
    const gameCommissionPct = 3;
    const attestors = 1;

    deployer.deploy(GolfGame, players, entryFee, attestors, gameCommissionPct);
};