# Random question order

Plays 5 questions picked at random from a pool of 8, in a random order, so every show is different.
A question is never asked twice in a show. Each question shows `Question 2 of 5`.

## Files

- `random-question-order.qx`: the quiz, a start slide, 8 questions and an end slide
- `RandomQuestionOrder.js`: the script, the same on every slide

## How the quiz is set up

| Slide | Metadata in the properties |
| --- | --- |
| Start slide (banner) | Id: `start` |
| Each question of the pool | Class: `pool` |
| End slide (banner), after the pool | Id: `end` |

Every one of these slides has the same script. Each question has a text box with
`[jsvar.questionNumber]`.

## How it works

- After a slide Quiz Show asks the script where to go next: `onNextSlide(currentSlideNumber)`. The
  script returns the number of a random question of the pool that was not played yet, or `'#end'`
  (the slide with id `end`) after 5 questions. Returning nothing means: just the next slide.
- The script needs to remember which questions were played, but its variables are gone when the
  slide is left. `qx['randomOrder.played']` keeps the list for the next slides. It holds text, so
  the list is stored as JSON: `JSON.stringify([3, 7])` and back with `JSON.parse()`.
- The start slide empties the list, so a restarted quiz starts over.
- The script console in the Director shows the next question:
  `Next: question 2, slide 4: Which ocean is the largest?`

Without the script, or with an error in it, the quiz simply plays all slides in order.

## Make it your own

- Play more or fewer questions: `const questionsToPlay = 5;` at the top.
- Add questions to the pool: give them Class `pool` and the same script. Put them before the end
  slide.
- More rounds: give each round its own class (`round1`, `round2`) and end slide, and change
  `poolClass` and `endSlide` in the scripts of that round.
