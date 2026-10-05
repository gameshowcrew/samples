# Questions from the web

Every time Quiz Show shows a question, the script gets a new random question with four answers from
the [Open Trivia Database](https://opentdb.com) and puts the correct answer at a random position.
Run the quiz twice and you get different questions.

## Files

- `open-trivia-database.qx`: the quiz, an explanation slide and 10 multiple choice questions
- `OpenTriviaQuestion.js`: the script, the same on every question

## How it works

1. `onLoadSlide()` runs before Quiz Show shows the slide, and `await fetch(url)` downloads a
   question from `https://opentdb.com/api.php`. Quiz Show waits for it, at most 10 seconds.
2. `JSON.parse(response.text)` turns the answer into an object with the question, the correct
   answer and three wrong answers.
3. The correct answer goes in at a random position, and the script changes the slide:

   ```js
   slide.setQuestion(question);
   slide.setAnswers(answers);
   slide.setCorrectAnswer(letter);     // 'A' to 'D'
   ```

   These change the slide for this show only; the quiz file stays as it is.
4. The script console in the Director shows the question with the correct answer marked, for the
   quiz master.

When there is no internet connection, or the database has no question for the settings, the slide
stays as it was typed in Quiz Studio. So type a real question there as a fallback.

## Things to know

- The Open Trivia Database accepts one request every 5 seconds. Don't click through the questions
  faster than that, or the slide shows its typed question.
- **Test** in the script editor shows the question that would be used in the console, without
  changing the slide.

## Make it your own

The settings at the top of the script:

```js
const category = 9;             // 9 General Knowledge, 11 Film, 12 Music, 17 Science & Nature...
const difficulty = 'medium';    // 'easy', 'medium' or 'hard', or '' for any
```

All categories are listed at https://opentdb.com/api_config.php.
