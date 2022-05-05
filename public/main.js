// Add cors dependency
//const cors = require('cors')
// Set up cors middleware on all endpoints
//app.use(cors())

// Focus div based on nav button click
const homeClick = document.getElementById("homenav")
homeClick.addEventListener("click", homeNav)
function homeNav() {
    document.getElementById("home").classList.remove("hidden");
    document.getElementById("single").classList.add("hidden");
    document.getElementById("multi").classList.add("hidden");
    document.getElementById("guess").classList.add("hidden");
}

const oneClick = document.getElementById("singlenav")
oneClick.addEventListener("click", oneNav)
function oneNav() {
    document.getElementById("home").classList.add("hidden");
    document.getElementById("single").classList.remove("hidden");
    document.getElementById("multi").classList.add("hidden");
    document.getElementById("guess").classList.add("hidden");
}

const multiClick = document.getElementById("multinav")
multiClick.addEventListener("click", multiNav)
function multiNav() {
    document.getElementById("home").classList.add("hidden");
    document.getElementById("single").classList.add("hidden");
    document.getElementById("multi").classList.remove("hidden");
    document.getElementById("guess").classList.add("hidden");
}

const guessClick = document.getElementById("guessnav")
guessClick.addEventListener("click", guessNav)
function guessNav() {
    document.getElementById("home").classList.add("hidden");
    document.getElementById("single").classList.add("hidden");
    document.getElementById("multi").classList.add("hidden");
    document.getElementById("guess").classList.remove("hidden");
}

// Flip one coin and show coin image to match result when button clicked
// Button coin flip element
const flipOne = document.getElementById("flipOne")
flipOne.addEventListener("click", flipCoin)
function flipCoin() {
    const response = fetch('http://localhost:5000/app/flip/', {mode: 'cors'})
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            console.log(result);
            document.getElementById("result").innerHTML = result.flip;
            document.getElementById("quarter").setAttribute("src", "./assets/img/"+result.flip+".png");
            
        })
}

// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series
// Our flip many coins form
const coins = document.getElementById("coins")
// Add event listener for coins form
coins.addEventListener("submit", flipCoins)
// Create the submit handler
async function flipCoins(event) {
    event.preventDefault();
    
    const url = "http://localhost:5000/app/flip/coins/"

    const formEvent = event.currentTarget

    try {
        const formData = new FormData(formEvent);
        const flips = await sendFlips({ url, formData });
        console.log(flips)
        document.getElementById("heads").innerHTML = "Heads (Blue): "+flips.summary.heads;
        document.getElementById("tails").innerHTML = "Tails (Red): "+flips.summary.tails;
        let piChart = document.getElementById("pi")
        piChart.style.display = "block";
        let headPerc = (flips.summary.heads / (flips.summary.heads + flips.summary.tails))*100;
        let tailPerc = 100-headPerc;
        piChart.style.backgroundImage = "conic-gradient(blue "+headPerc+"%, red "+tailPerc+"%)"
    } catch (error) {
        console.log(error);
    }
}
// Create a data sender
async function sendFlips({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJson = JSON.stringify(plainFormData);

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: formDataJson
    };

    const response = await fetch(url, options);
    return response.json()
}




// Guess a flip by clicking either heads or tails button
const guessHeads = document.getElementById("guessHeads")
guessHeads.addEventListener("click", guessH)
async function guessH() {
    const url = 'http://localhost:5000/app/flip/call/'

    try {
        const guess = await sendGuess({ url, formData: "{\"call\":\"heads\"}" });

        console.log(guess);
        document.getElementById("yourGuess").innerHTML = guess.call;
        document.getElementById("guessActual").innerHTML = guess.flip;
        document.getElementById("victory").innerHTML = guess.result+"!";
        document.getElementById("quarterGuess").setAttribute("src", "./assets/img/"+guess.call+".png");
        document.getElementById("quarterActual").setAttribute("src", "./assets/img/"+guess.flip+".png");
    } catch (error) {
        console.log(error);
    }
}
const guessTails = document.getElementById("guessTails")
guessTails.addEventListener("click", guessT)
async function guessT() {
    const url = 'http://localhost:5000/app/flip/call/'

    try {
        const guess = await sendGuess({ url, formData: "{\"call\":\"tails\"}" });

        console.log(guess);
        document.getElementById("yourGuess").innerHTML = guess.call;
        document.getElementById("guessActual").innerHTML = guess.flip;
        document.getElementById("victory").innerHTML = guess.result+"!";
        document.getElementById("quarterGuess").setAttribute("src", "./assets/img/"+guess.call+".png");
        document.getElementById("quarterActual").setAttribute("src", "./assets/img/"+guess.flip+".png");
    } catch (error) {
        console.log(error);
    }
}

// Create a data sender
async function sendGuess({ url, formData }) {
    const formDataJson = formData;

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: formDataJson
    };

    const response = await fetch(url, options);
    return response.json()
}
