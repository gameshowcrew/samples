# Hot streak bonus

Rewards teams that keep answering correctly: every 3 correct answers in a row earn 50 bonus points.
After each question the slide names the teams on a streak (`Team 4: 3 in a row, +50 points!`), and
at the end a scoreboard slide shows the longest streaks of the show.

## Files

- `hot-streak-bonus.qx`: the quiz, a start slide with the rules, 6 questions and the streaks slide
- `HotStreak.js`: the script, the same on every slide

## How the quiz is set up

| Slide | Metadata | Text box |
| --- | --- | --- |
| Start slide (banner) | Id: `start` | |
| Each question: multiple choice, everybody answers, automatically judged | | `[jsvar.streakNews]` |
| Streaks slide (banner) | Id: `streaks` | `[jsvar.streakBoard]` |

Every one of these slides has the same script.

## How it works

1. `onVote(player, answer, isCorrect)` remembers which teams answered the question correctly.
2. When the time is up or everybody answered (`onTimeout()` / `onEndCountdown()`), `judge()`
   updates the streak of every team: one more for a correct answer, back to 0 for a wrong answer
   or no answer. At 3, 6, 9... in a row the team gets the bonus: `team.score += 50`.
3. The streaks of all teams are kept in `qx['hotStreak.streaks']` as JSON, so they survive from
   one slide to the next:

   ```json
   { "3": { "name": "Team 3", "streak": 2, "best": 4 } }
   ```

4. `qx['streakNews']` names the teams on a streak of 3 or more, under the answers of the question.
5. The streaks slide sorts the teams by their longest streak and shows the top 5, one per line, in
   `qx['streakBoard']`.
6. The start slide empties the streaks, so a restarted quiz starts over.

The script console in the Director shows every bonus: `Team 3: 3 in a row, 50 bonus points`.

## Things to know

- The bonus is added to the score of the team. In Analyzer the results of a question show the
  points of that question only.
- Depending on the settings Quiz Show calls `onEndCountdown()` after the time ran out, or only
  `onTimeout()`. The script judges each question once.
- Questions that are not of type Question (like a test question) are not counted.

## Make it your own

The settings at the top of the script:

```js
const streakLength = 3;         // correct answers in a row for a bonus
const bonusPoints = 50;         // points for every streakLength correct answers in a row
const boardSize = 5;            // number of teams on the streaks slide
```

Ideas: double the bonus for a longer streak (`bonusPoints * entry.streak / streakLength`), or put
the streaks slide in the middle of the quiz as well; it shows the streaks so far.
