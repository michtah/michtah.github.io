if (localStorage.getItem('theme') === 'dark')  {document.body.classList.remove("light-theme");}
if (localStorage.getItem('theme') === 'light') {document.body.classList.add("light-theme");}

if (localStorage.getItem('glow') === 'off')    {document.body.classList.add("no-glow");}
if (localStorage.getItem('glow') === 'on')     {document.body.classList.remove("no-glow");}

const lightDarkBtn = document.getElementById("light-dark-button");
const glowBtn = document.getElementById("glow-button");

if (lightDarkBtn) {
    if (localStorage.getItem('theme') === 'light') {
        lightDarkBtn.textContent = "Turn Dark";
    } else {
        lightDarkBtn.textContent = "Turn Light";
    }
}

if (glowBtn) {
    if (localStorage.getItem('glow') === 'off') {
        glowBtn.textContent = "Add Glow";
    } else {
        glowBtn.textContent = "Remove Glow";
    }
}

function lightMode() {
    document.body.classList.toggle('light-theme');
    let x = document.getElementById("light-dark-button");
    if (x.textContent === "Turn Dark") {
        localStorage.setItem('theme', 'dark');
        x.textContent = "Turn Light";
    } else {
        localStorage.setItem('theme', 'light');
        x.textContent = "Turn Dark";
    }
}

function blurMode() {
    document.body.classList.toggle('no-glow');
    let x = document.getElementById("glow-button");
    if (x.textContent === "Remove Glow") {
        localStorage.setItem('glow', 'off');
        x.textContent = "Add Glow";
    } else {
        localStorage.setItem('glow', 'on');
        x.textContent = "Remove Glow";
    }
}