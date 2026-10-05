////////////////////////////////////////////////////////////////////////////////////////////////////
// Hurry up!
//
// Builds up the tension at the end of the countdown: a message on the slide in the last seconds,
// optionally with tension music, and 'Time's up!' when the time ran out.
//
// The slide: a question with a countdown and a text box that shows [jsvar.hurryUp]. Insert it with
// the Symbols button of the text box, or just type it.
////////////////////////////////////////////////////////////////////////////////////////////////////

// The settings
const messages = {              // seconds left: the message
    10: 'Ten seconds left!',
    5: 'Hurry up!'
};
const tensionMusic = '';        // a sound file to play in the last 10 seconds, like 'C:\\Music\\tension.mp3'
const musicFrom = 10;           // seconds left when the music starts

let message = '';               // the message of the countdown, to show again after a pause
let musicPlaying = false;       // to play on after a pause

function onLoadSlide(slide) {
    show('');
    if (tensionMusic)
        qx.sink.sound.loadMusic('tension', tensionMusic, false);
}

// The countdown starts, or resumes after a pause
function onStartCountdown() {
    show(message);
    if (musicPlaying)
        qx.sink.sound.playMusic('tension');
}

// Every second of the countdown
//   secondsLeft - the seconds on the clock
function onCountdownTick(secondsLeft) {
    if (messages[secondsLeft]) {
        message = messages[secondsLeft];
        show(message);
    }
    if (tensionMusic && secondsLeft === musicFrom) {
        qx.sink.sound.playMusic('tension');
        musicPlaying = true;
    }
}

// The countdown stops: the time is up, everybody answered, or the quiz master paused it
function onEndCountdown(isPaused) {
    if (isPaused) {
        show('Paused...');
        if (musicPlaying)
            qx.sink.sound.pauseMusic('tension');
    } else {
        // everybody answered before the time was up, onTimeout() comes after this when it ran out
        show('');
        stopMusic();
    }
}

// The time to answer ran out
function onTimeout() {
    show("Time's up!");
}

// The slide is left, for any reason, the music must not go on
function onUnloadSlide(slide) {
    stopMusic();
    if (tensionMusic)
        qx.sink.sound.unloadMusic('tension');
}

function show(text) {
    qx['hurryUp'] = text;
}

function stopMusic() {
    if (musicPlaying)
        qx.sink.sound.stopMusic('tension');
    musicPlaying = false;
}
