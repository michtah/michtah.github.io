function lightMode() {
    document.body.classList.toggle('light-theme');
    let x = document.getElementById("light-dark-button")
    if (x.textContent === "Turn Dark") {
        x.textContent = "Turn Light"
    } else {
        x.textContent = "Turn Dark"
    }
}

function blurMode() {
    document.body.classList.toggle('no-glow')
    let x = document.getElementById("glow-button")
    if (x.textContent === "Remove Glow") {
        x.textContent = "Add Glow"
    } else {
        x.textContent = "Remove Glow"
    }
}