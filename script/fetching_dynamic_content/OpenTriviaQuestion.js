////////////////////////////////////////////////////////////////////////////////////////////////////
// Random trivia question from the Open Trivia Database (https://opentdb.com)
//
// Every time Quiz Show shows this slide, it gets a new question with four answers and puts the
// correct answer at a random position (A to D).
//
// The slide: a multiple choice question with 4 answers. What you type in Quiz Studio is used when
// there is no internet connection, so type a real question there. Text that is too long for its
// box gets a smaller font, so give the question and answers some room.
//
// Test shows the question that would be used in the console below, without changing the slide.
////////////////////////////////////////////////////////////////////////////////////////////////////

// The settings, see https://opentdb.com/api_config.php for all categories
//   9 General Knowledge, 11 Film, 12 Music, 17 Science & Nature, 21 Sports, 22 Geography,
//   23 History, 26 Celebrities, 27 Animals
const category = 9;
const difficulty = 'medium';    // 'easy', 'medium' or 'hard', or '' for any

async function onLoadSlide(slide) {
    // encode=url3986 keeps quotes and accents intact, decodeURIComponent() restores the text
    let url = 'https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986' +
        '&category=' + category;
    if (difficulty)
        url += '&difficulty=' + difficulty;

    // Quiz Show waits for the answer before it shows the slide, at most 10 seconds
    let response;
    try {
        response = await fetch(url);
    } catch (error) {
        console.warn('No question from the Open Trivia Database, the slide stays as it is.',
            error.message);
        return;
    }

    if (response.status !== 200) {
        console.warn('The Open Trivia Database answered ' + response.status + ' ' +
            response.statusText + ', the slide stays as it is.');
        return;
    }

    // response_code 0 is OK, 1 means no question for these settings, 5 too many requests (max 1 per
    // 5 seconds)
    const data = JSON.parse(response.text);
    if (data.response_code !== 0 || data.results.length === 0) {
        console.warn('No question for these settings (response code ' + data.response_code +
            '), the slide stays as it is.');
        return;
    }

    const trivia = data.results[0];
    const question = decodeURIComponent(trivia.question);
    const correctAnswer = decodeURIComponent(trivia.correct_answer);
    const answers = trivia.incorrect_answers.map(answer => decodeURIComponent(answer));

    // the correct answer at a random position
    const position = Math.floor(Math.random() * (answers.length + 1));
    answers.splice(position, 0, correctAnswer);
    const letter = String.fromCharCode(65 + position);     // 0 = A, 1 = B...

    slide.setQuestion(question);
    slide.setAnswers(answers);
    slide.setCorrectAnswer(letter);

    // for the quiz master: the Script console in the Director, never on the screen
    console.log(decodeURIComponent(trivia.category) + ': ' + question);
    answers.forEach((answer, i) => console.log('  ' + String.fromCharCode(65 + i) + '. ' + answer +
        (i === position ? '  (correct)' : '')));
}
