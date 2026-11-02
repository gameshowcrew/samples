# QuizXpress script API

Everything a slide script can use. Member names are camelCase in JavaScript (`slide.slideNumber`,
`qx.sink.gotoSlide()`). If something is not listed here, it is not available: do not guess.

## Contents

- [Handlers](#handlers)
- [qx](#qx)
- [slide](#slide)
- [SlideType](#slidetype)
- [player](#player)
- [qx.sink](#qxsink)
- [sound](#sound)
- [Global functions](#global-functions)
- [When things run](#when-things-run)

## Handlers

Functions with these names are called by Quiz Show when the script defines them. A handler that is
not defined changes nothing.

### The slide

| Handler | Called when |
|---|---|
| `onLoadSlide(slide)` | The slide is shown, after the top-level code. `slide` is the same as `qx.slide`. May be `async` to `await fetch()`: Quiz Show waits for it before it shows the slide. |
| `onUnloadSlide(slide)` | The slide is about to be left, for any reason: next, previous, a jump from the Director or `gotoSlide()`. Clean up here (stop music). |

### The countdown

| Handler | Called when |
|---|---|
| `onStartCountdown()` | The countdown starts, or resumes after a pause. |
| `onCountdownTick(secondsLeft)` | Every second of the countdown; `secondsLeft` is the number on the clock. |
| `onEndCountdown(isPaused)` | The countdown stops: `true` if paused, `false` if it ended. |
| `onTimeout()` | The time to answer ran out. |

Depending on the question settings Quiz Show calls `onEndCountdown(false)`, `onTimeout()` or both
at the end of a question. See "End of the question exactly once" in `patterns.md`.

### The answers

| Handler | Called when |
|---|---|
| `onVote(player, answer, isCorrect)` | A team answered with its keypad (multiple choice, voting). `answer` as on the keypad, like `'A'`. `isCorrect` is `false` when wrong or the slide has no correct answer. Also called when a team changes its answer. **Not** called on Wager and Demographic slides: read `player.lastVote` from a timer or in `onUnloadSlide()` there. |
| `onFastestFinger(player)` | A team pressed first on a fastest finger question. |
| `onCorrectAnswer(player)` | The answer of the fastest team was judged correct. |
| `onIncorrectAnswer(player)` | The answer of the fastest team was judged wrong. |
| `onScoreChanged(player, oldScore, newScore)` | The score of a team changed. |

### What is next

| Handler | Called when |
|---|---|
| `onCommandNext()` | The 'next' command (button, key, remote). Return `true`: the script handled it, Quiz Show does nothing. Return `false`: Quiz Show handles it as usual. |
| `onNextSlide(currentSlideNumber)` | Quiz Show is about to go to the next slide and the slide has no 'Next slide' set. Return a slide number (0-based), a slide id string like `'#final'`, or a slide from `qx.slides`. Return nothing for the normal next slide. |

## qx

The global entry point.

| Member | Description | Example |
|---|---|---|
| `qx.slide` | The current [slide](#slide). | `let notes = qx.slide.notes;` |
| `qx.slides` | All slides of the quiz (expensive, cache it in a variable). | `let final = qx.slides.find(s => s.id === 'final');` |
| `qx.teams` | All teams, as [players](#player). | `qx.teams.filter(t => t.lastVote === 'A').length` |
| `qx.leaderBoard` | The teams by score, the leader first. Can be empty. | `let leader = qx.leaderBoard[0];` |
| `qx.roundLeaderBoard` | Scores of the current round (since the last End of Round slide). Entries have `team` (a player) and `roundScore`. | `qx.roundLeaderBoard[0].team.name` |
| `qx.groups` | Names of the demographic groups. | |
| `qx['name']` | A named value kept across slides until Quiz Show closes (also over a restart). Shown on a slide with `[jsvar.name]`, which redraws when the value changes. Unset: `null`. | `qx['roundname'] = 'Geography';` |
| `qx.utils.message(text)` | Write a line to the log file of Quiz Show. | |
| `qx.sink` | Quiz Show itself, see [qx.sink](#qxsink). | |

## slide

`qx.slide`, the `slide` argument of handlers, and the entries of `qx.slides`.

| Member | Description |
|---|---|
| `slideType` | The type, compare with [SlideType](#slidetype). |
| `slideNumber` | Slide number, 0-based. |
| `question` | The question text. |
| `answers` | Array with the answer texts. |
| `correctAnswer` | The correct answer. |
| `notes` | The slide notes. |
| `category` | The category (topic). |
| `hasVideo`, `hasAudio` | `true` if the slide has a video / audio. |
| `isPictureQuestion` | `true` for a picture question. |
| `answerTime` | Countdown time in seconds. |
| `pointsAtStart`, `pointsAtEnd` | Points at the start and end of the question. |
| `penaltyPointsAtStart`, `penaltyPointsAtEnd` | Penalty points for a wrong answer. |
| `id` | The slide id ('Metadata' in Studio; `SlideId` property in the MCP). |
| `class` | The slide class ('Metadata' in Studio; `SlideClass` property in the MCP). |
| `slide['fieldName']` | A custom slide field, like `slide['DasLightScene']`. |
| `setQuestion(text)` | Replace the question text, for this show only. |
| `setAnswers(answers)` | Replace the answers in order (A, B, C...), for this show only. At most as many as the slide has. |
| `setCorrectAnswer(letters)` | `'B'`, or `'AC'` when more answers are correct. For this show only. |

Use the `set...` functions in `onLoadSlide()`, before the slide is shown. With Test in Studio they
leave the slide alone. On Trivia Feud slides the visible title is not `question`.

## SlideType

```javascript
if (slide.slideType === SlideType.Question) { ... }
```

`Question`, `TestQuestion`, `Banner` (billboard), `EndOfRound`, `Demographic`, `LastManStanding`,
`AudienceResponse`, `Wager`, `Minigame`, `MajorityRules`, `JeopardyRound` (Trivia Board round),
`TriviaLadderRound`, `BingoRound`, `TriviaFeud`, `SpeedRound`, `PairingQuestion`.

## player

Entries of `qx.teams` / `qx.leaderBoard`, the `player` argument of handlers,
`qx.sink.playerFromDevice()` and `qx.sink.winnerOfLastQuestion`.

| Member | Description |
|---|---|
| `name` | Get or set the name. |
| `group` | The demographic group. |
| `lastVote` | The last answer received, like `'A'` (may be empty). |
| `keypad` | The keypad number. |
| `score` | Get or set the score. `player.score += 50` adds bonus points (not on test questions; Analyzer shows the points of the question only). |
| `excluded` | Get or set whether the player is excluded. |
| `timeUsed` | Time used (decimal number). |
| `isMobilePlayer` | `true` when playing on a phone (web keypad). |
| `id` | Unique id (GUID). |

## qx.sink

| Member | Description |
|---|---|
| `gotoSlide(slideNumber)` | Jump to a slide (0-based). Throws for a negative number or one past the last slide. Ignores 'Next slide'. Safe from a timer. |
| `endQuiz()` | End the quiz. |
| `restartQuiz()` | Restart the quiz. |
| `playerFromDevice(device)` | The player on a device (keypad) number. |
| `winnerOfLastQuestion` | The player who won the last question. |
| `players` | All players. |
| `quizFile` | File name of the running quiz. |
| `keypads` | The buzzer subsystem. |
| `sound` | The [sound subsystem](#sound). |

With Test in Studio, `qx.sink` is a dummy: navigation and sound do nothing.

## sound

`qx.sink.sound`.

| Function | Description |
|---|---|
| `loadMusic(name, filename, loop)` | Load a sound file under a name. `"C:\\Music\\song.mp3"` (double backslashes). |
| `playMusic(name)` | Play a loaded sound, or continue after `pauseMusic()`. |
| `pauseMusic(name)` | Pause. |
| `stopMusic(name)` | Stop. |
| `unloadMusic(name)` | Unload and free it. |
| `setMusicVolume(name, volume)` | Volume of one sound, 0-100. |
| `setVolume(volume)` | Playback volume, 0-100. |
| `startPlaylist(files, volume)` | Play a list of files. |
| `endPlaylist()` | Stop the playlist. |
| `playBuzzerSound(keypad)` | The buzzer sound of a keypad. |

Load in the top-level code or `onLoadSlide()`, stop (and unload) in `onUnloadSlide()`.

## Global functions

| Function | Description |
|---|---|
| `console.log(...)`, `info`, `warn`, `error` | Write to the script console. Any number of values, also objects and arrays. |
| `fetch(url)` | Download a page or web service response. Gives `{ status, statusText, text }` - no `json()`, use `JSON.parse(response.text)`. Waits at most 10 seconds, throws on failure. `await` it in an `async` handler. |
| `setTimeout(fn, ms)` | Run once after `ms`. From 8.6: returns an id for `clearTimeout()` and is cancelled when the slide is left. Up to 8.5: returns nothing and keeps running after the slide is left. |
| `clearTimeout(id)` | Cancel a `setTimeout()`. From 8.6. |
| `setInterval(fn, ms)` | Run repeatedly; returns an id. Stopped automatically when the slide is left. |
| `clearInterval(id)` | Stop a `setInterval()`. |
| `sendUDP(ip, port, message)` | Send text over UDP (no error handling). |
| `sendTCP(ip, port, message)` | Send text over TCP. |
| `sendOSC(ip, port, address, p1, [p2])` | Send an OSC message, like `sendOSC('127.0.0.1', 4532, '/scene1', 20)`. |
| `getEnv(name)` | An environment variable, for settings that differ per PC. |
| `sleep(ms)` | Wait. The whole show waits too: keep it very short. |
| `alert(message)` | Message box that halts the show. Debugging only; use `console.log()`. |

## When things run

1. The slide is shown: a new engine is made, `qx`, `console`, the functions above and `SlideType`
   are set, the top-level code runs, then `onLoadSlide(slide)`.
2. While shown: the handlers as events happen; timer callbacks on a background thread.
3. The slide is left: `onUnloadSlide(slide)`, then the engine is thrown away with its variables
   and timers (up to 8.5 a pending `setTimeout` survives). `qx['name']` values stay.

Errors are reported to the script console with the handler, slide number, line and column, and
the show goes on; the rest of that handler is skipped. A failing timer callback is reported and
the interval keeps running.
