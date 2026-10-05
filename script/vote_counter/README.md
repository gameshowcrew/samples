# Vote counter

Shows on the slide how many teams answered so far, while the countdown runs:
`7 of 12 teams answered`. When the time is up, the script console in the Director shows how often
each answer was given, for the quiz master only.

## Files

- `vote-counter.qx`: the quiz, three multiple choice questions with this script
- `VoteCounter.js`: the script of each question

## How it works

Each question has a text box with `[jsvar.answered]` under the answers.

- `onLoadSlide()` sets `qx['answered']` to `0 of 12 teams answered`. The value of the previous
  question would otherwise still be on the screen.
- Quiz Show calls `onVote(player, answer, isCorrect)` for every answer that comes in. The script
  remembers the answer of each team by its keypad number, so a team that changes its answer (when
  that is allowed) still counts once, and updates `qx['answered']`.
- When the countdown ends (`onEndCountdown()`) or the time runs out (`onTimeout()`), the script
  counts the answers and writes them to the console: `Answers: A 3, B 7, D 1`.

Teams that the quiz master excluded from the game don't count.

## Things to know

- `onVote()` is called for questions where everybody answers (voting) with keypads or phones; on a
  fastest finger question only the fastest team answers.
- Depending on the settings Quiz Show calls `onEndCountdown()` after the time ran out, or only
  `onTimeout()`. The script handles both and counts once.

## Make it your own

- Show a percentage: `Math.round(answered * 100 / teams) + '% answered'`.
- Show who still has to answer: `qx.teams.filter(team => !(team.keypad in answers))`.
