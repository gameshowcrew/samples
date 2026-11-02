////////////////////////////////////////////////////////////////////////////////////////////////////
// Timer on a wager slide
//
// Gives the teams a fixed time to place their bets: the time left counts down on the slide, and
// when it reaches 0:00 the show goes on to the question by itself.
//
// The slide: a wager slide with a text box that shows the value of this script:
//   [jsvar.timer]      the time left, like 0:15
// Insert it with the Symbols button of the text box, or just type it.
////////////////////////////////////////////////////////////////////////////////////////////////////

// The settings
const seconds = 15;             // the time to place a bet

let secondsLeft = seconds;
let timer = null;

function onLoadSlide(slide) {
    secondsLeft = seconds;
    showTime();
    timer = setInterval(() => tick(slide), 1000);
}

// every second
function tick(slide) {
    secondsLeft--;
    showTime();
    if (secondsLeft <= 0) {
        clearInterval(timer);
        qx.sink.gotoSlide(slide.slideNumber + 1);     // the next slide: the question
    }
}

// when the quiz master goes on before the time is up, the timer stops by itself; clear the text
// so it does not show on another slide with [jsvar.timer]
function onUnloadSlide(slide) {
    qx['timer'] = '';
}

// 75 seconds becomes '1:15'
function showTime() {
    qx['timer'] = Math.floor(secondsLeft / 60) + ':' + String(secondsLeft % 60).padStart(2, '0');
}
