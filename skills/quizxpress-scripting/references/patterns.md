# Script patterns

Recipes that are known to work. Each one names the text boxes it needs on the slide. Copy the
part you need and keep the settings at the top of the script.

## Contents

- [Skeleton](#skeleton)
- [Countdown on the screen that goes on by itself](#countdown-on-the-screen-that-goes-on-by-itself)
- [A clock](#a-clock)
- [Messages during the countdown](#messages-during-the-countdown)
- [End of the question exactly once](#end-of-the-question-exactly-once)
- [Counting answers](#counting-answers)
- [Values across slides](#values-across-slides)
- [Choosing the next slide](#choosing-the-next-slide)
- [Bonus points](#bonus-points)
- [A question from the web](#a-question-from-the-web)
- [Music](#music)
- [Lighting and other equipment](#lighting-and-other-equipment)
- [A delay that must not outlive the slide](#a-delay-that-must-not-outlive-the-slide)

## Skeleton

```javascript
////////////////////////////////////////////////////////////////////////////////////////////////////
// <What the script does, in one or two lines>
//
// The slide: <which slide type> with text boxes that show the values of this script:
//   [jsvar.name]       <what it shows, with an example>
////////////////////////////////////////////////////////////////////////////////////////////////////

// The settings
const seconds = 15;             // <what it means>

function onLoadSlide(slide) {
}

function onUnloadSlide(slide) {
}
```

Comments explain *why* and what the user can change; the examples in the samples repo are the
model for tone and density.

## Countdown on the screen that goes on by itself

Slide: a text box `[jsvar.timer]`. Works on any slide type, also those without a countdown of their
own (wager, billboard). Full example: `script/wager_timer`.

```javascript
const seconds = 15;             // the time on the clock

let secondsLeft = seconds;
let timer = null;

function onLoadSlide(slide) {
    secondsLeft = seconds;
    showTime();
    timer = setInterval(() => tick(slide), 1000);
}

function tick(slide) {
    secondsLeft--;
    showTime();
    if (secondsLeft <= 0) {
        clearInterval(timer);
        qx.sink.gotoSlide(slide.slideNumber + 1);
    }
}

// the timer stops by itself when the slide is left; clear the text for other slides
function onUnloadSlide(slide) {
    qx['timer'] = '';
}

// 75 seconds becomes '1:15'
function showTime() {
    qx['timer'] = Math.floor(secondsLeft / 60) + ':' + String(secondsLeft % 60).padStart(2, '0');
}
```

- On the last slide `slideNumber + 1` does not exist (`gotoSlide` throws): use `qx.sink.endQuiz()`
  there, or check `slide.slideNumber + 1 < qx.slides.length`.
- To follow the slide's own countdown instead, use `onCountdownTick(secondsLeft)`; to go on when the
  question's own time is up, use the end-of-question pattern below and `gotoSlide()` there.

## A clock

Slide: `[jsvar.clock]`. Full example: `script/live_clock`.

```javascript
function onLoadSlide(slide) {
    update();
    setInterval(update, 500);   // twice a second so it never skips a second
}

function update() {
    const now = new Date();
    qx['clock'] = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2, '0')).join(':');
}
```

## Messages during the countdown

Slide: `[jsvar.hurryUp]`. Full example: `script/countdown_hurry_up`.

```javascript
const messages = {
    10: 'Ten seconds left!',
    5: 'Hurry up!'
};

function onLoadSlide(slide) { qx['hurryUp'] = ''; }

function onCountdownTick(secondsLeft) {
    if (messages[secondsLeft])
        qx['hurryUp'] = messages[secondsLeft];
}

function onTimeout() { qx['hurryUp'] = "Time's up!"; }
```

## End of the question exactly once

Quiz Show calls `onEndCountdown(false)` and/or `onTimeout()`, depending on the question settings.

```javascript
let done = false;

function onTimeout() { endOfQuestion(); }
function onEndCountdown(isPaused) { if (!isPaused) endOfQuestion(); }

function endOfQuestion() {
    if (done)
        return;
    done = true;
    // ...
}
```

## Counting answers

Slide: `[jsvar.answered]`. Full example: `script/vote_counter`. Multiple choice and voting slides
only (`onVote` is not called on wager and demographic slides).

```javascript
const answers = {};             // keypad -> answer; a changed answer replaces the old one

function onLoadSlide(slide) { show(); }

function onVote(player, answer, isCorrect) {
    answers[player.keypad] = answer;
    show();
}

function show() {
    const teams = qx.teams.filter(team => !team.excluded).length;
    qx['answered'] = Object.keys(answers).length + ' of ' + teams + ' teams answered';
}
```

Collect the answers in `onVote()` rather than reading `player.lastVote` of all teams: `lastVote`
may still hold the answer of an earlier question.

## Values across slides

```javascript
// first slide of the quiz: start fresh, values survive a restart of the quiz otherwise
qx['streaks'] = JSON.stringify({});

// any later slide
let streaks = JSON.parse(qx['streaks'] || '{}');
streaks[player.id] = (streaks[player.id] || 0) + 1;
qx['streaks'] = JSON.stringify(streaks);
```

Key per team on `player.id` (a GUID), not on the name, which the quiz master can change.

## Choosing the next slide

Only called when the slide has no 'Next slide' set. Give target slides an id (`SlideId`) or class
(`SlideClass`). Full example: `script/random_question_order`.

```javascript
function onNextSlide(currentSlideNumber) {
    const leader = qx.leaderBoard[0];
    if (leader && leader.score >= 100)
        return '#final';
    // nothing returned: the normal next slide
}
```

Picking from a pool by class:

```javascript
function onNextSlide(currentSlideNumber) {
    const played = JSON.parse(qx['played'] || '[]');
    const pool = qx.slides.filter(s => s.class === 'pool' && !played.includes(s.slideNumber));
    if (pool.length === 0)
        return '#end';
    const next = pool[Math.floor(Math.random() * pool.length)];
    played.push(next.slideNumber);
    qx['played'] = JSON.stringify(played);
    return next;
}
```

## Bonus points

Full example: `script/hot_streak_bonus`.

```javascript
const bonus = 50;

function onCorrectAnswer(player) {      // fastest finger questions
    player.score += bonus;
    console.log(player.name + ' gets ' + bonus + ' bonus points');
}
```

For multiple choice, `onVote()` also fires when a team changes its answer: collect the answers per
keypad (see Counting answers) and award at the end of the question (end-of-question pattern), so a
changed answer is not rewarded twice.

## A question from the web

The slide needs as many answers as you set. Full example: `script/fetching_dynamic_content`.

```javascript
async function onLoadSlide(slide) {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
        if (response.status !== 200)
            throw new Error(response.status + ' ' + response.statusText);
        const q = JSON.parse(response.text).results[0];
        const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
        slide.setQuestion(q.question);
        slide.setAnswers(answers);
        slide.setCorrectAnswer(String.fromCharCode(65 + answers.indexOf(q.correct_answer)));
        console.log('Correct: ' + q.correct_answer);    // for the quiz master, not on screen
    } catch (e) {
        console.warn('No question from the web, showing the question of the quiz: ' + e.message);
    }
}
```

Always keep a sensible question in the quiz itself as the fallback.

## Music

```javascript
const music = 'C:\\Music\\tension.mp3';     // double backslashes

qx.sink.sound.loadMusic('tension', music, true);   // true: loop

function onStartCountdown() { qx.sink.sound.playMusic('tension'); }
function onEndCountdown(isPaused) {
    if (isPaused) qx.sink.sound.pauseMusic('tension');
    else qx.sink.sound.stopMusic('tension');
}
function onUnloadSlide(slide) {
    qx.sink.sound.stopMusic('tension');
    qx.sink.sound.unloadMusic('tension');
}
```

Suggest muting the question's own countdown sound when the script plays music.

## Lighting and other equipment

```javascript
const host = getEnv('LIGHTS_HOST') || '127.0.0.1';  // per PC without editing the quiz

function onLoadSlide(slide) { sendOSC(host, 4532, '/scene', 1); }
function onCorrectAnswer(player) { sendUDP(host, 53432, 'correct'); }
function onIncorrectAnswer(player) { sendUDP(host, 53432, 'wrong'); }
```

A custom slide field (`slide['DasLightScene']`) lets the quiz author choose a scene per slide
without touching the script.

## A delay that must not outlive the slide

Up to QuizXpress 8.5 `setTimeout` keeps running after the slide is left (from 8.6 it stops with
the slide, and a plain `setTimeout` is fine). For a delayed action that must not happen once the
quiz master went on, in any version, use a one-shot interval, which the slide change stops:

```javascript
function later(fn, ms) {
    const id = setInterval(() => { clearInterval(id); fn(); }, ms);
}

function onEndCountdown(isPaused) {
    if (!isPaused)
        later(() => qx.sink.sound.playMusic('levels'), 2000);
}
```
