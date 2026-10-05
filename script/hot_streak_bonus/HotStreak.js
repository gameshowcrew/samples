////////////////////////////////////////////////////////////////////////////////////////////////////
// Hot streak bonus
//
// Rewards teams that keep answering correctly: every 3 correct answers in a row earn 50 bonus
// points. After each question the slide names the teams that are on a streak, and a scoreboard
// slide shows the longest streaks of the show.
//
// The quiz:
//   - a start slide with slide id 'start', it explains the rules
//   - multiple choice questions where everybody answers (voting), automatically judged, with a text
//     box that shows [jsvar.streakNews]
//   - a slide with slide id 'streaks', with a text box that shows [jsvar.streakBoard]
// Every one of these slides has this same script. The slide id is under Metadata in the properties
// of the slide. Insert [jsvar....] with the Symbols button of a text box, or just type it.
//
// The bonus points are added to the score of the team, the results of the question in Analyzer
// show the points of the question itself.
////////////////////////////////////////////////////////////////////////////////////////////////////

// The settings
const streakLength = 3;         // correct answers in a row for a bonus
const bonusPoints = 50;         // points for every streakLength correct answers in a row
const boardSize = 5;            // number of teams on the streaks slide

// The streaks of all teams, by keypad: { 3: { name: 'Team 3', streak: 2, best: 4 }, ... }.
// Variables of a script are gone when the slide is left, qx['...'] keeps a value for the next
// slides. It holds text, so the streaks are stored as JSON.
function loadStreaks() {
    return JSON.parse(qx['hotStreak.streaks'] || '{}');
}

function saveStreaks(streaks) {
    qx['hotStreak.streaks'] = JSON.stringify(streaks);
}

// The teams that answered this question correctly, by keypad
const correct = {};
let judged = false;

function onLoadSlide(slide) {
    if (slide.id === 'start') {
        // a new show, also after a restart of the quiz
        saveStreaks({});
    }

    if (slide.id === 'streaks')
        showBoard();

    // nothing to tell yet on a new question
    qx['streakNews'] = '';
}

// A team answered, the last answer counts when a team changes its answer
function onVote(player, answer, isCorrect) {
    correct[player.keypad] = isCorrect;
}

// The countdown stops: everybody answered, the time is up, or the quiz master paused it
function onEndCountdown(isPaused) {
    if (!isPaused)
        judge();
}

// The time to answer ran out. Depending on the settings Quiz Show calls onEndCountdown() after this
// or not, judge() counts each question once.
function onTimeout() {
    judge();
}

// Update the streaks with the answers to this question
function judge() {
    if (judged || qx.slide.slideType !== SlideType.Question)
        return;
    judged = true;

    const streaks = loadStreaks();
    const onFire = [];
    for (const team of qx.teams) {
        if (team.excluded)
            continue;

        const entry = streaks[team.keypad] || { name: team.name, streak: 0, best: 0 };
        entry.name = team.name;     // the quiz master may have renamed the team
        if (correct[team.keypad]) {
            entry.streak++;
            entry.best = Math.max(entry.best, entry.streak);
            if (entry.streak % streakLength === 0) {
                team.score += bonusPoints;
                console.log(team.name + ': ' + entry.streak + ' in a row, ' + bonusPoints +
                    ' bonus points');
            }
            if (entry.streak >= streakLength)
                onFire.push(entry);
        } else {
            entry.streak = 0;
        }
        streaks[team.keypad] = entry;
    }
    saveStreaks(streaks);

    qx['streakNews'] = news(onFire);
}

// 'Team 4: 3 in a row, +50 points!' for one team, 'On fire: Team 4 (3, +50), Team 7 (4)' for more
function news(onFire) {
    if (onFire.length === 0)
        return '';

    onFire.sort((a, b) => b.streak - a.streak);
    const bonus = entry => entry.streak % streakLength === 0 ? ', +' + bonusPoints : '';
    if (onFire.length === 1) {
        const entry = onFire[0];
        return entry.name + ': ' + entry.streak + ' in a row' +
            (bonus(entry) ? bonus(entry) + ' points!' : '!');
    }

    const names = onFire.slice(0, 3)
        .map(entry => entry.name + ' (' + entry.streak + bonus(entry) + ')');
    const more = onFire.length > 3 ? ' and ' + (onFire.length - 3) + ' more' : '';
    return 'On fire: ' + names.join(', ') + more;
}

// The longest streaks of the show, one team per line
function showBoard() {
    const entries = Object.values(loadStreaks())
        .filter(entry => entry.best > 0)
        .sort((a, b) => b.best - a.best || b.streak - a.streak);

    if (entries.length === 0) {
        qx['streakBoard'] = 'No streaks yet';
        return;
    }

    qx['streakBoard'] = entries.slice(0, boardSize)
        .map((entry, i) => (i + 1) + '. ' + entry.name + ' - ' + entry.best + ' in a row' +
            (entry.streak === entry.best && entry.streak >= streakLength ? ' and counting' : ''))
        .join('\n');
}
