// Returns HTML objects relevant to the App
const timerObject = document.getElementById("timer");
const answerObject = document.getElementById("answer");
const questionObject = document.getElementById("question");
const scoreObject = document.getElementById("score");
const gameObject = document.getElementById("game");
const gameDisplayObject = document.getElementById("gameDisplay");
const restartObject = document.getElementById("restart");
const settings = document.getElementById("settings");
const scoreHistory = document.getElementById("scoreHistory");

// These are constants that should be updated with the game settings
let TIMELIMIT = 120;
let LEFTARGS = {};
let RIGHTARGS = {};
const OP_DICT = {'add': '+', 'mul': '\xD7', 'div': '\xF7', 'sub': '\u2013'};
let OPS = 0;
let ans = -1;
let score = 0;
let history = [];


let timer = 0;  // Initialising
let startTime = Date.now();



// Every time we input a new number, check if the answer is correct
document.addEventListener("keyup", event => {
    checkAnswer();    
});

// Restarts the game everytime the button is clicked, equivalent to making settings again
// incase the user has changed the settings
restartObject.onclick = function(){
    clearInterval(timer);
    makeSettings();
}

settings.addEventListener('submit', event => {
    makeSettings();  
});

// Sets the settings of the game and the starts the game
function makeSettings(){
    let formData = new FormData(settings);
    setBounds(formData);
    TIMELIMIT = parseInt(formData.get("timeLimit"));
    gameDisplayObject.hidden = false;
    resetGame();    
}

// Sets the bounds of the game. Collects the inputs for add and multiply first, the deletes as required
function setBounds(formData){
    LEFTARGS = {};
    RIGHTARGS = {};     

    // Collect the ranges first, as if all of the options were checked
    for(key of ["add", "mul"]){
        const leftKeyMin = "l" + key + "min";
        const leftKeyMax = "l" + key + "max";
        const rightKeyMin = "l" + key + "min";
        const rightKeyMax = "r" + key + "max";
        LEFTARGS[key] = [parseInt(formData.get(leftKeyMin)), parseInt(formData.get(leftKeyMax))];
        RIGHTARGS[key] = [parseInt(formData.get(rightKeyMin)), parseInt(formData.get(rightKeyMax))];              
    }
    LEFTARGS["div"] = LEFTARGS["mul"];
    RIGHTARGS["div"] = RIGHTARGS["mul"];

    LEFTARGS["sub"] = LEFTARGS["add"];
    RIGHTARGS["sub"] = RIGHTARGS["add"];

    // Delete the options that were not checked
    for(key of Object.keys(OP_DICT)){
        if(formData.get(key) !== "on"){
            delete LEFTARGS[key];
            delete RIGHTARGS[key];
        }
    }

    OPS = Object.keys(LEFTARGS);
}


// Returns a whole number between min and max inclusive
function randNum(min, max){
    return min + Math.floor(Math.random() * (max - min + 1));
}

// Returns a random element in an array
function randElement(arr){
    return arr[randNum(0, arr.length - 1)];
}

// Returns a random element within a range [lower, upper]
function randNumRange(range){
    return randNum(range[0], range[1]);
}

// Return the answer for addition or multiplication
function getAnswer(op, left, right){
    if(op === "add"){
        return (left + right);
    }else if(op === "mul"){
        return (left * right);
    }else{
        return null;
    }
}

// Randomly generates a question with the correct text
function generateQuestion(){
    const operator = randElement(OPS);
    let leftArg = randNumRange(LEFTARGS[operator]);
    let rightArg = randNumRange(RIGHTARGS[operator]);

    // Reassignment of variables as division and subtraction are reversed
    // Logic here is that the answer is already 'generated'
    if(operator === "div"){
        ans = rightArg;
        rightArg = leftArg;
        leftArg *= ans; 
    }else if(operator === "sub"){
        ans = rightArg;
        rightArg = leftArg;
        leftArg += ans;
    }else{
        ans = getAnswer(operator, leftArg, rightArg);
    }

    // Update the displayed text for the game
    const questionText = leftArg.toString() + " " + OP_DICT[operator] + " " + rightArg.toString();
    questionObject.textContent = questionText;
    
    console.log(questionText);
    console.log(ans);
}

// Checks if the answer is correct, and generates a new question while incrementing score if it is
function checkAnswer(){
    if(answerObject.value === ans.toString()){
        generateQuestion();
        answerObject.value = "";        
        score++;
        updateScoreText();
    }
}

// Simply hides the question and the timer
function gameOver(){
    checkAnswer();
    gameObject.hidden = true;
    timerObject.hidden = true;    
    history.push(score.toString());
    scoreHistory.innerText = "Score History: " + history.join("\t");
    console.log(history);
}

// Updates the current score text
function updateScoreText(){
    scoreObject.textContent = "Score: " + score.toString();
}



// Restarts a new game
function resetGame(){
    if(typeof timer !== 'undefined'){
        clearInterval(timer);
    }    
    gameObject.hidden = false;
    timerObject.hidden = false;
    answerObject.value = "";  
    score = 0;
    updateScoreText();
    startTime = Date.now();
    timerObject.textContent = "Time Left: " + TIMELIMIT.toString();
    timer = setInterval(myTimer, 1000);
    generateQuestion();    
    answerObject.focus();    
}

// Sets up the timer that is displayed, uses the element ID "timer". 
function myTimer(){
    timeDiff = Math.floor((Date.now() -startTime)/1000);
    timePassed = TIMELIMIT - timeDiff;
    if(timePassed === 0){
        clearInterval(timer);
        gameOver();
    }
    timerObject.textContent = "Time Left: " + timePassed.toString();
}