# Wager timer

Gives the teams a fixed time to place their bets on a wager slide. The time left counts down on the
slide, and at `0:00` the show goes on to the question by itself, without the quiz master pressing
next.

## Files

- `wager-timer.qx`: the quiz, a banner, a wager slide with the timer and the question to bet on
- `WagerTimer.js`: the script of the wager slide

## How it works

The wager slide has a text box with `[jsvar.timer]` under the bets, showing the time left like
`0:15`.

| Handler | When | What the script does |
| --- | --- | --- |
| `onLoadSlide()` | the slide is shown | shows the full time, starts a timer with `setInterval(..., 1000)` |
| the timer | every second | one second less in `qx['timer']`; at 0 stops the timer and calls `qx.sink.gotoSlide()` |
| `onUnloadSlide()` | the slide is left | clears `qx['timer']` |

`qx.sink.gotoSlide(slide.slideNumber + 1)` jumps to the slide after the wager slide: the question.
The bets are registered the moment a team presses its keypad, so they all count.

The quiz master can still go on earlier with next. The timer then stops by itself, as all timers of
a script do when the slide is left, so the show does not jump again later.

## Make it your own

- Set the time at the top of the script: `const seconds = 15;`. Longer times show as `1:30`.
- The text box is an ordinary text box: change its font, size and color in Quiz Studio, or type
  `Bets close in [jsvar.timer]`.
- Combine it with the slide's own sounds, or play tension music with `qx.sink.sound` (see
  [countdown_hurry_up](../countdown_hurry_up)).
- The script always goes to the slide right after the wager slide; a Next slide set on the wager
  slide is not used.
