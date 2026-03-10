//very badly made test incremental
let matter = 10;
let dimensions = [0, 0, 0, 0, 0, 0, 0, 0];
let dimensionsPurchases = [0, 0, 0, 0, 0, 0, 0, 0];
let dimensionsMultipliers = [1, 1, 1, 1, 1, 1, 1, 1];
let dt = 0.03;
let tickspeed = 1e7; // this is inaccessible to the user. it is simply used by me, the developer, to make the game run faster so I can more easily check if anything grows uncontrollably.
let tickspeedGrowth = 1;
let tickspeedGrowthPotential = 1;
let purchaseGrowth = 2;
let purchaseGrowthPotential = 2;

// the dimension cost formula. it grows with the dimension index and purchases.
function getDimensionCost(i) {
    return Math.pow(10, Math.floor(2.2 * Math.pow(i, 1.3)) + 1 + Math.floor(dimensionsPurchases[i] * 0.1) * Math.floor(3 + i*0.2));
}

// function that buys dimensions.
function buyDimension(i, amount=1) {
    let cost = getDimensionCost(i) * amount;
    if (matter >= cost) {
        matter -= cost;
        dimensions[i] += amount;
        dimensionsPurchases[i] += amount;
        dimensionsMultipliers[i] *= Math.pow(purchaseGrowth, 0.1 * amount);
    }
}

// function that buys tickspeed growth. this resets the matter and dimensions, but increases the tickspeed growth multiplier based on how much matter you have. this is a prestige mechanic.
function buyTickspeed() {
    if (tickspeedGrowthPotential > tickspeedGrowth) {
        matter = 10;
        dimensions = [0, 0, 0, 0, 0, 0, 0, 0];
        dimensionsPurchases = [0, 0, 0, 0, 0, 0, 0, 0];
        dimensionsMultipliers = [1, 1, 1, 1, 1, 1, 1, 1];
        tickspeedGrowth = tickspeedGrowthPotential;
    }
}

// function that buys purchase growth. this resets the matter and dimensions, but increases the purchase growth multiplier based on how much matter you have. this is a prestige mechanic.
// the purchase growth determines how much the multipliers grow when you buy dimensions. it is currently set up so that every 10 purchases of a dimension, the multiplier growth increases by the purchase growth multiplier. this means that the more you buy, the more you get from each purchase, and the purchase growth multiplier increases that growth.
// this growth is per dimension, not every ten dimensions. (ie. 2 dimensions gives purchaseGrowth^0.2 multiplier).
function buyPurchaseGrowth() {
    if (purchaseGrowthPotential > purchaseGrowth) {
        matter = 10;
        dimensions = [0, 0, 0, 0, 0, 0, 0, 0];
        dimensionsPurchases = [0, 0, 0, 0, 0, 0, 0, 0];
        dimensionsMultipliers = [1, 1, 1, 1, 1, 1, 1, 1];
        purchaseGrowth = purchaseGrowthPotential;
    }
}

// buys all dimensions as much as possible
function buyMax() {
    for (let i = 0; i < dimensions.length; i++) {
        let cost = getDimensionCost(i);
        while (matter >= cost) {
            buyDimension(i);
            cost = getDimensionCost(i);
        }
    }    
}

// calculates the tickspeed growth multiplier based on the amount of matter you have. it grows logarithmically, so that it is more efficient to buy tickspeed growth when you have more matter, but it still provides some growth when you have less matter.
function calculateTickspeedGrowth(matter) {
    return 1 + Math.log10(matter + 1) * 0.05;
}

// calculates the purchase growth multiplier based on the amount of matter you have. it grows logarithmically, so that it is more efficient to buy purchase growth when you have more matter, but it still provides some growth when you have less matter.
function calculatePurchaseGrowthMultiplier(matter) {
    return 2 + Math.log10(matter + 1) * 0.002;
}

// formats numbers in a more readable way. it uses suffixes for large numbers, and scientific notation for very large numbers. it also rounds to 2 decimal places for small numbers, and 2 significant figures for large numbers.
// todo: add a way for the user to let ALL the numbers be scientific or keep the suffixes until No.
// todo: add double exponentials when you import the break_infinity library.
function formatNumber(num) {
    if (num < 1e3) {
        return num.toFixed(2);
    } else {
        const units = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
        const exponent_unit = Math.floor(Math.log10(num) / 3);
        const exponent_reg = Math.floor(Math.log10(num));
        const mantissa = num / Math.pow(10, exponent_unit * 3);
        if (exponent_unit < units.length) {
            return mantissa.toFixed(2) + " " + units[exponent_unit - 1];
        } else {
            return mantissa.toFixed(2) + "e" + exponent_reg;
        }
    }    
}

// does one tick of the game.
function doTick() {
    // the first dimension generates matter, and each dimension generates the previous dimension. the growth is determined by the tickspeed and tickspeed growth multipliers.
    matter += dimensions[0] * dimensionsMultipliers[0] * dt * tickspeed * tickspeedGrowth;
    // the rest of the dimensions generate the previous dimension, with the same growth multipliers.
    for (let i = 1; i < dimensions.length; i++) {
        dimensions[i - 1] += dimensions[i] * dimensionsMultipliers[i] * dt * tickspeed * tickspeedGrowth;
    }

    // update the display. this shows the current matter, the gain per second, the amount of each dimension and their multipliers, and the cost of buying each dimension. it also shows the tickspeed growth and purchase growth potentials if they are available.
    document.getElementById("matter").textContent = "Matter: " + formatNumber(matter);
    document.getElementById("matterGain").textContent = "You are gaining " + formatNumber(dimensions[0] * dimensionsMultipliers[0] * tickspeed * tickspeedGrowth) + " matter per second.";
    for (let i = 0; i < dimensions.length; i++) {
        document.getElementById("dimension" + (i + 1)).textContent = "Dimension " + (i + 1) + ": " + formatNumber(dimensions[i]) + " (x" + formatNumber(dimensionsMultipliers[i]) + ")";
    }
    for (let i = 0; i < dimensions.length; i++) {
        document.getElementById("button" + (i + 1)).textContent = "Buy 1 (Cost: " + formatNumber(getDimensionCost(i)) + ")";
        if (matter >= getDimensionCost(i)) {
            document.getElementById("button" + (i + 1)).disabled = false;
        } else {
            document.getElementById("button" + (i + 1)).disabled = true;
        }
        document.getElementById("button" + (i + 1) + "buy10").textContent = "Buy 10 (Cost: " + formatNumber(getDimensionCost(i) * 10) + ")";
        if (matter >= getDimensionCost(i) * 10) {
            document.getElementById("button" + (i + 1) + "buy10").disabled = false;
        } else {
            document.getElementById("button" + (i + 1) + "buy10").disabled = true;
        }
    }
    // the tickspeed growth is only available if you have at least 1 of the 8th dimension, and the purchase growth is only available if you have at least 1 of the 8th dimension and more than 1e130 matter, to prevent early game players from being overwhelmed by too many mechanics. the growth potentials are calculated based on the current matter, and show how much growth you can get if you buy the tickspeed or purchase growth right now. they also show the potential growth compared to the current growth, so you can see how much better it would be to buy it right now.
    document.getElementById("buttonTickspeed").textContent = "Reset matter to boost Tickspeed (Currently: " + formatNumber(tickspeedGrowth) + "x)";
    if (dimensions[7] > 0) {
        tickspeedGrowthPotential = calculateTickspeedGrowth(matter);
        document.getElementById("buttonTickspeed").disabled = false;
        document.getElementById("tickspeedGrow").textContent = "Tick Speed: " + formatNumber(tickspeedGrowth) + ", Can Go: " + formatNumber(tickspeedGrowthPotential) + ", Potential Growth: " + formatNumber(tickspeedGrowthPotential/tickspeedGrowth) + "x)";
    } else {
        tickspeedGrowthPotential = 1;
        document.getElementById("buttonTickspeed").disabled = true;
    }
    if (dimensions[7] > 0 && matter > 1e130) {
        purchaseGrowthPotential = calculatePurchaseGrowthMultiplier(matter);
        document.getElementById("buttonPurchaseMultiplier").disabled = false;
        document.getElementById("buyGrow").textContent = "Per 10 purchase multiplier: " + formatNumber(purchaseGrowth) + ", Can Go: " + formatNumber(purchaseGrowthPotential) + ", Potential Growth: " + formatNumber(purchaseGrowthPotential/purchaseGrowth) + "x)";
    } else {
        purchaseGrowthPotential = 2;
        document.getElementById("buttonPurchaseMultiplier").disabled = true;
    }
}

// start the game loop. this calls the doTick function every dt seconds, which updates the game state and the display.
// todo: separate the game loop and the display update, so that the display can be updated more frequently than the game state, to make it smoother. this would involve using requestAnimationFrame for the display update, and setInterval for the game loop, and making sure that they are synced up properly.
setInterval(doTick, dt * 1000);