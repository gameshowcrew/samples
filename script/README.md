# QuizXpress script examples

A slide in QuizXpress can have a script: JavaScript that runs while Quiz Show shows the slide. With a
script a slide can react to the countdown, the answers of the teams and the quiz master, show live
information on the screen, change its question or decide which slide comes next.

Each folder has a ready to run quiz (`.qx`), the script as a separate `.js` file and a README that
explains it. From simple to more elaborate:

| Example | What it shows | Script features |
| --- | --- | --- |
| [live_clock](live_clock) | A live clock and a countdown to the start of the quiz on a banner slide | `setInterval()`, `[jsvar.name]` on a slide |
| [vote_counter](vote_counter) | "7 of 12 teams answered" while the countdown runs | `onVote()`, `qx.teams` |
| [countdown_hurry_up](countdown_hurry_up) | "Hurry up!" in the last seconds, optional tension music, "Time's up!" | `onCountdownTick()`, `onTimeout()`, `qx.sink.sound` |
| [random_question_order](random_question_order) | 5 random questions out of a pool, in a random order | `onNextSlide()`, values that stay between slides |
| [fetching_dynamic_content](fetching_dynamic_content) | A new question from the Open Trivia Database every time | `fetch()`, `slide.setQuestion()`/`setAnswers()` |
| [hot_streak_bonus](hot_streak_bonus) | Bonus points for 3 correct answers in a row, and a streaks scoreboard | all of the above, changing scores |

## Trying an example

1. Open the `.qx` file in Quiz Studio.
2. Select a slide and open its **Script** in the properties. The script editor shows the script;
   **Test** runs it, its output appears in the console below the script.
3. Run the quiz in Quiz Show. The Director has a **Script** button with the same console, for
   messages of `console.log()` and errors in the script. Nothing of the console appears on the
   projected screen.

## The basics

- **One script per slide.** It starts when Quiz Show shows the slide and stops when the slide is
  left. When more slides need the same behavior, each of them gets the same script.
- **Handlers.** The script defines functions with known names that Quiz Show calls:
  `onLoadSlide(slide)`, `onCountdownTick(secondsLeft)`, `onVote(player, answer, isCorrect)`,
  `onTimeout()`, `onNextSlide(currentSlideNumber)` and more. A new script in Quiz Studio starts
  with a template that lists them all, with explanations.
- **`qx`** is the quiz: `qx.slide`, `qx.slides`, `qx.teams`, `qx.leaderBoard`, `qx.sink` (sound,
  navigation). Type `qx.` in the script editor or press Ctrl+Space for the list.
- **Showing values on a slide.** `qx['name'] = value` in the script, `[jsvar.name]` in a text box of
  the slide. The text on the screen changes as soon as the script changes the value.
- **Values that stay.** Variables of a script are gone when the slide is left, `qx['name']` keeps
  its value for the next slides. It holds text and numbers; store lists and objects with
  `JSON.stringify()` and read them back with `JSON.parse()`.
- **Errors** in a script go to the script console; the show goes on.
