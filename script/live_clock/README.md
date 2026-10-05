# Live clock

A banner slide that shows the current time, ticking every second, and how long it takes until the
quiz starts. Nice to have on the screen while the audience comes in.

## Files

- `live-clock.qx`: the quiz, a welcome banner with the clock and one question
- `LiveClock.js`: the script of the banner

## How it works

The banner has two text boxes:

| Text box | Shows |
| --- | --- |
| `[jsvar.clock]` | the time, like `19:42:07` |
| `[jsvar.startsIn]` | `The quiz starts in 17:53`, or `Here we go!` once it is time |

When Quiz Show shows the banner it calls `onLoadSlide()`. That starts a timer with
`setInterval(update, 500)`, which puts the time in `qx['clock']` and `qx['startsIn']`. A text box
with `[jsvar.clock]` shows the value of `qx['clock']`, and changes as soon as the script changes it.

The timer stops by itself when Quiz Show leaves the slide.

## Make it your own

- Set the start time at the top of the script: `const startTime = '20:00';`, or `''` to show only
  the clock.
- Use the clock on any slide: copy the script and add a text box with `[jsvar.clock]`.
- The text boxes are ordinary text boxes: change their font, size and color in Quiz Studio.
