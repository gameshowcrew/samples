////////////////////////////////////////////////////////////////////////////////////////////////////
// Vote counter
//
// Shows on the slide how many teams answered so far, while the countdown runs: '7 of 12 teams
// answered'. When the time is up, the script console shows how often each answer was given.
//
// The slide: a multiple choice question where everybody answers (voting), with a text box that
// shows [jsvar.answered]. Insert it with the Symbols button of the text box, or just type it.
////////////////////////////////////////////////////////////////////////////////////////////////////

// The answer of each team, by keypad number. A team that changes its answer (when that is allowed)
// is still one team.
const answers = {};

function onLoadSlide(slide) {
    // the value of the previous question is still there, start at 0
    show();
}

// A team answered
//   player    - the team: name, keypad, score...
//   answer    - the answer as on the keypad, like 'A'
//   isCorrect - true if the answer is correct
function onVote(player, answer, isCorrect) {
    answers[player.keypad] = answer;
    show();
}

// The countdown stops: the time is up, everybody answered, or the quiz master paused it
function onEndCountdown(isPaused) {
    if (isPaused)
        return;

    // count each answer, like { A: 3, C: 5 }
    const counts = {};
    for (const answer of Object.values(answers))
        counts[answer] = (counts[answer] || 0) + 1;

    // for the quiz master: the Script console in the Director, never on the screen
    const summary = Object.keys(counts).sort().map(answer => answer + ' ' + counts[answer]).join(', ');
    console.log(summary ? 'Answers: ' + summary : 'Nobody answered');
}

function show() {
    // teams the quiz master excluded from the game do not count
    const teams = qx.teams.filter(team => !team.excluded).length;
    const answered = Object.keys(answers).length;
    qx['answered'] = answered + ' of ' + teams + ' teams answered';
}
