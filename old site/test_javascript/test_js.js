/*
TODO:
- Buy Functions:
    - Buy 1 and Buy 10 for each dimension DONE
    - Update costs and amounts when buying DONE
- Production:
    - Each dimension produces the next dimension
    - Update amounts based on production
- Upgrades:
    - Tickspeed Boost: Resets matter to boost tickspeed (how fast the game pretends to run; essentially a multiplier for production) DONE
        - This dictates how much production is boosted. For example, if the tickspeed boost is 2x, then all production is doubled.
        - Therefore if the tickspeed boost is T, production is multiplied by T.
        - By default the tickspeed boost is 1x. However the tickspeed boost can increase this multiplier, allowing for faster production.
        - Formula for tickspeed boost (where x is matter amount): T = 1 + log10(x + 1) / 6 + x^(0.002) ? (maybe change this formula later)
    - Purchase Boost: Resets matter to boost purchase multiplier (how much production is boosted from purchasing dimensions): DONE
        - This dictates how much production is boosted from purchasing dimensions. For example, if the purchase boost is 3x, then each dimension's production multiplier is multiplied by 3.
        - Therefore if the purchase boost is P, each dimension's production multiplier is multiplied by P.
        - By default the purchase boost is 2x. However the purchase boost can increase this multiplier, allowing for more powerful production boosts from purchasing dimensions.
        - !!! The purchase boost is PER 10 DIMENSIONS. If you buy one dimension the purchase boost increases by P^(0.1).
        - Formula for purchase boost (where x is matter amount): P = 2 + log10(x + 1) / 12 + x^(0.0001) ? (maybe change this formula later)
- UI Updates:
    - Update dimension texts to show current amounts
    - Update upgrade texts to show current boost levels
*/

// include break eternity

// our free variables: matter, tickspeedBoost, and purchaseBoost. these are global variables that track the player's current matter, tickspeed boost, and purchase boost.
let matter = 10; // start with 10 matter so the player can buy a 1st dimension.
let tickspeedBoost = 1;
let purchaseBoost = 2;

const dt0 = 0.03; // initial gametick. this is how long each loop will last.
const gamespeed = 1e4; // multiplier for game speed. this way we can test the game without having to wait for progress.
const dt = dt0 * gamespeed; // the actual timestep used in the game loop, which is the initial gametick multiplied by the game speed multiplier.
// ! dt0 is the real-time duration of each tick
// ! dt is the effective duration of each tick, used to calculate a tick of the game.

// ! do not confuse gamespeed with tickspeed. gamespeed is a universal multiplier, tickspeed is a multiplier for matter dimensions.


// dimension object. contains amount, production multiplier, cost, and amount bought.
// costs are determined by a formula based on the dimension number.
// the costs can increase if a dimension is bought, however.
class Dimension {
    constructor(dimensionNumber) {
        this.dimension = dimensionNumber;
        this.name = dimensionNumber === 1 ? "1st Dimension" : dimensionNumber === 2 ? "2nd Dimension" : dimensionNumber === 3 ? "3rd Dimension" : dimensionNumber + "th Dimension";
        this.amount = 0;
        this.bought = 0;
        this.productionMultiplier = 1;
        // we set higher dimensions to be more expensive.
        this.cost = this.calculateBuyCost(dimensionNumber, 0);
    }

    calculateBuyCost(d, b) {
        return Math.pow(10,
            Math.floor(
                Math.pow(d, 1.1)*(3*b+1)
            )
        );
    }

    // we separate bought and amount because it's the purchases that determine cost and production multiplier, not the amount.
    buyOne() {
        if (matter >= this.cost) {
            // the obvious stuff
            matter -= this.cost;
            this.amount += 1;
            this.bought += 1;
            
            // the not so obvious stuff like updating the cost and production multiplier after buying
            // the cost formula makes the amount increase exponentially. higher dimensions grow even faster.
            this.cost = this.calculateBuyCost(this.dimension, Math.floor(this.bought*0.1));
            // the production multiplier increases based on the amount bought.
            this.productionMultiplier = Math.pow(purchaseBoost, this.bought / 10);
        }
    }

    // the buyTen function actually completes the bought to the nearest ten.
    buyTen() {
        let buyAmount = 10 - (this.bought % 10); // how many to buy to get to the nearest ten
        if (matter >= this.cost * buyAmount) {
            matter -= this.cost * buyAmount;
            this.amount += buyAmount;
            this.bought += buyAmount;

            // identical to the buyOne function, we update the cost and production multiplier after buying.
            this.cost = this.calculateBuyCost(this.dimension, Math.floor(this.bought*0.1));
            this.productionMultiplier = Math.pow(purchaseBoost, this.bought / 10);
        }
    }

    // the buyMax function buys as many dimensions as possible with the current matter. this is used for the "Buy Max" button.
    buyMax() {
        while (matter >= this.cost) {
            this.buyOne();
        }
    }

    // check if player can afford to buy a dimension. this is used to enable or disable the buy buttons.
    canAfford() {
        return matter >= this.cost;
    }

    // check if player can affort to buy up to ten. this is used to enable or disable the buy 10 button.
    canAfford10() {
        return matter >= this.cost * (10 - this.bought % 10);
    }
}

// create an array of dimensions. we have 8 dimensions, so we create 8 dimension objects and store them in an array for easy access.
let dimensions = [];
for (let i = 1; i <= 8; i++) {
    dimensions.push(new Dimension(i));
}

// get the tickspeed boost based on matter. this is used for the tickspeed boost upgrade.
function getTickspeedBoost() {
    return 1 + Math.log10(matter + 1) / 2 + Math.pow(matter, 0.002);
}

// get the purchase boost based on matter. this is used for the purchase boost upgrade.
// since the purchase boost stacks, we ought to make it weaker. also we'll softcap it to be less than nine.
function getPurchaseBoost() {
    return 2 + Math.pow(Math.log10(matter/1e40 + 1), 0.4);
}

// check if the tickspeed boost would be better than the current tickspeed boost. this is used to enable or disable the tickspeed boost button.
// furthermore, the user needs to have at least one 4th dimension to buy this.
function canBoostTickspeed() {
    return getTickspeedBoost() > tickspeedBoost && dimensions[3].amount > 0;
}

// check if the purchase boost would be better than the current purchase boost. this is used to enable or disable the purchase boost button.
// furthermore, the user needs to have at least one 8th dimension to buy this.
function canBoostPurchase() {
    return getPurchaseBoost() > purchaseBoost && dimensions[7].amount >= 20;
}

function buyMaxDimensions() {
    for (let i = dimensions.length - 1; i >= 0; i--) {
        dimensions[i].buyMax();
    }
}

// boost tickspeed by resetting matter. this is used for the tickspeed boost upgrade.
function boostTickspeed() {
    if (canBoostTickspeed()) {
        tickspeedBoost = getTickspeedBoost();
        matter = 10;
        for (let i = 0; i < dimensions.length; i++) {
            dimensions[i].amount = 0;
            dimensions[i].bought = 0;
            dimensions[i].cost = dimensions[i].calculateBuyCost(dimensions[i].dimension, 0);
            dimensions[i].productionMultiplier = 1;
        }
        updateUI();
        gameTick();
    }
}

// boost purchase multiplier by resetting matter. this is used for the purchase boost upgrade.
function boostPurchase() {
    if (canBoostPurchase()) {
        purchaseBoost = getPurchaseBoost();
        matter = 10;
        for (let i = 0; i < dimensions.length; i++) {
            dimensions[i].amount = 0;
            dimensions[i].bought = 0;
            dimensions[i].cost = dimensions[i].calculateBuyCost(dimensions[i].dimension, 0);
            dimensions[i].productionMultiplier = 1;
        }
        updateUI();
        gameTick();
    }
}

// do one tick of the game.
function gameTick() {
    // each dimension produces the previous dimension. the 1st dimension produces matter, the 2nd dimension produces the 1st dimension, and so on.
    // lets first make the 1st dimension produce matter.
    matter += dimensions[0].amount * dimensions[0].productionMultiplier * tickspeedBoost * dt;

    // now we make the higher dimensions produce the lower dimensions.
    for (let i = 1; i < dimensions.length; i++) {
        dimensions[i - 1].amount += dimensions[i].amount * dimensions[i].productionMultiplier * tickspeedBoost * dt;
    }
    // update the UI after each tick.
    updateUI();
}

// a formatting tool to make our numbers look nice
function formatNumber(x) {
    if (x == 0) return "0.00";
    let prefixes = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
    let exponent = Math.floor(Math.log10(x));
    let mantissa = x / Math.pow(10, exponent);

    if (x < 1e3) {
        return x.toFixed(2);
    }
    if (exponent < 33) {
        mantissa *= Math.pow(10, exponent%3);
        exponent = Math.floor(exponent / 3) - 1;
        return mantissa.toFixed(2) + " " + prefixes[exponent];
    }
    return mantissa.toFixed(2) + "e" + exponent;
}

// update the UI to reflect the current game state.
function updateUI() {
    /*
    There is a lot of things to update, so here we'll keep a running list of what we need to update:
    - Matter text
    - Matter dimension text
        - Amount
        - Production multiplier
    - Upgrade text
        - Tickspeed boost text
        - Purchase boost text
    - Update button statuses
        - Cost
        - Tickspeed boost
        - Purchase boost
    */

    // Update matter text
    // You have <span id="matter-amount-display">10</span> matter.
    document.getElementById("matter-amount-display").textContent = formatNumber(matter);

    // Update matter dimension text
    for (let i = 0; i < dimensions.length; i++) {
        document.getElementById("matter-dimension-text-" + (i+1)).textContent =
            dimensions[i].name + ": " + formatNumber(dimensions[i].amount) +
            " (x" + formatNumber(dimensions[i].productionMultiplier) + ") "
    }

    // Update upgrade text
    document.getElementById("tickspeed-boost-text").textContent =
        "Current Tickspeed: " + formatNumber(tickspeedBoost);

    document.getElementById("purchase-boost-text").textContent =
        "Per 10 Purchases: Production x" + formatNumber(purchaseBoost);
    
    // Update dimension buttons
    for (let i = 0; i < dimensions.length; i++) {
        let btn1 = document.getElementById("dim" + (i+1) + "buy1");
        let btn10 = document.getElementById("dim" + (i+1) + "buy10");

        btn1.textContent = "Buy 1: " + formatNumber(dimensions[i].cost) + " Matter";
        btn10.textContent = "Buy 10: " + formatNumber(dimensions[i].cost * (10 - dimensions[i].bought % 10)) + " Matter";

        btn1.disabled = !dimensions[i].canAfford();
        btn10.disabled = !dimensions[i].canAfford10();
    }

    // Update boost buttons
    if (canBoostTickspeed()) {
        document.getElementById("tickspeed-boost-button").textContent =
            "Reset matter for Tickspeed Boost: " +
            formatNumber(tickspeedBoost) + " → " + formatNumber(getTickspeedBoost()) +
            "(x" + formatNumber(getTickspeedBoost()/tickspeedBoost) + ")";
        document.getElementById("tickspeed-boost-button").disabled = false;
    }
    else {
        if (dimensions[3].amount <= 0) document.getElementById("tickspeed-boost-button").textContent = "Buy a 4th Dim to unlock"
        else document.getElementById("tickspeed-boost-button").textContent = "Not enough matter to boost tickspeed"
    }

    if (canBoostPurchase()) {
        document.getElementById("purchase-boost-button").textContent =
            "Reset matter for Purchase Boost: " +
            formatNumber(purchaseBoost) + " → " + formatNumber(getPurchaseBoost()) +
            "(x" + formatNumber(getPurchaseBoost()/purchaseBoost) + ")";
        document.getElementById("purchase-boost-button").disabled = false;
    }
    else {
        if (dimensions[7].amount < 20) document.getElementById("purchase-boost-button").textContent = "Buy 20 8th Dims to unlock"
        else document.getElementById("purchase-boost-button").textContent = "Not enough matter to boost tickspeed"
    }
}

setInterval(gameTick, dt0 * 1000);