# Hurry up!

Builds up the tension at the end of the countdown. With 10 seconds left the slide shows
`Ten seconds left!`, at 5 seconds `Hurry up!`, and `Time's up!` when the time ran out. Optionally
tension music plays during the last 10 seconds.

## Files

- `hurry-up.qx`: the quiz, two multiple choice questions with a countdown of 20 seconds
- `HurryUp.js`: the script of each question

## How it works

Each question has a text box with `[jsvar.hurryUp]` under the answers, in yellow.

| Handler | When | What the script does |
| --- | --- | --- |
| `onLoadSlide()` | the slide is shown | clears the message, loads the music |
| `onCountdownTick(secondsLeft)` | every second of the countdown | shows the message for that second, starts the music |
| `onEndCountdown(isPaused)` | the countdown pauses or ends | `Paused...` and pauses the music, or stops it |
| `onStartCountdown()` | the countdown starts or resumes | shows the message again, plays the music on |
| `onTimeout()` | the time ran out | `Time's up!` |
| `onUnloadSlide()` | the slide is left | stops and unloads the music |

The messages are in a list at the top of the script, by the number of seconds left:

```js
const messages = {
    10: 'Ten seconds left!',
    5: 'Hurry up!'
};
```

## Tension music

Set the path of a sound file at the top of the script:

```js
const tensionMusic = 'C:\\Music\\tension.mp3';     // in JavaScript a \ is written as \\
const musicFrom = 10;                              // seconds left when the music starts
```

The script loads it with `qx.sink.sound.loadMusic()` and plays it with `playMusic()`. Always stop
music in `onUnloadSlide()`: the quiz master can leave the slide at any moment.

## Make it your own

- More messages: add `3: 'Three...'`, `2: 'Two...'`, `1: 'One...'` to the list.
- Mute the normal countdown sound of the question (Mute countdown) when you use your own music.
