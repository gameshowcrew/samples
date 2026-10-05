////////////////////////////////////////////////////////////////////////////////////////////////////
// Live clock on a banner slide
//
// Shows the time, and how long it takes until the quiz starts, while the audience is waiting.
//
// The slide: a banner with text boxes that show the values of this script:
//   [jsvar.clock]      the time, like 19:42:07
//   [jsvar.startsIn]   'The quiz starts in 17:53', or 'Here we go!' once it is time
// Insert them with the Symbols button of the text box, or just type them.
////////////////////////////////////////////////////////////////////////////////////////////////////

// The settings
const startTime = '20:00';      // when the quiz starts (24 hour clock), '' to show only the clock

function onLoadSlide(slide) {
    update();
    // twice a second, so the clock never skips a second; the screen only changes when the text does
    setInterval(update, 500);
}

// the timers of setInterval() stop by themselves when the slide is left
function update() {
    const now = new Date();
    qx['clock'] = twoDigits(now.getHours()) + ':' + twoDigits(now.getMinutes()) + ':' +
        twoDigits(now.getSeconds());
    qx['startsIn'] = startsIn(now);
}

function startsIn(now) {
    if (!startTime)
        return '';

    // the start time today
    const [hours, minutes] = startTime.split(':').map(part => parseInt(part));
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    const secondsLeft = Math.ceil((start - now) / 1000);
    if (secondsLeft <= 0)
        return 'Here we go!';

    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor(secondsLeft / 60) % 60;
    const s = secondsLeft % 60;
    return 'The quiz starts in ' + (h > 0 ? h + ':' + twoDigits(m) : m) + ':' + twoDigits(s);
}

// 7 becomes '07'
function twoDigits(number) {
    return String(number).padStart(2, '0');
}
