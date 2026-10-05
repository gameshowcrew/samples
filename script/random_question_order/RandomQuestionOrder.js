////////////////////////////////////////////////////////////////////////////////////////////////////
// Random question order
//
// Plays a number of questions picked at random from a pool, in a random order, so every show is
// different. A question is never asked twice.
//
// The quiz:
//   - a start slide with slide id 'start'
//   - the questions of the pool, each with slide class 'pool'
//   - an end slide with slide id 'end', after the pool
// Every one of these slides has this same script. The slide id and slide class are under Metadata
// in the properties of the slide. The questions show [jsvar.questionNumber]: 'Question 2 of 5'.
//
// Without the script (or with an error in it) the quiz simply plays all slides in order.
////////////////////////////////////////////////////////////////////////////////////////////////////

// The settings
const questionsToPlay = 5;      // how many questions of the pool to play
const poolClass = 'pool';       // the slide class of the questions in the pool
const endSlide = '#end';        // the slide to go to after the last question

// The questions played so far, as slide numbers. Variables of a script are gone when the slide is
// left, qx['...'] keeps a value for the next slides. It holds text, so the list is stored as JSON.
function played() {
    return JSON.parse(qx['randomOrder.played'] || '[]');
}

function onLoadSlide(slide) {
    if (slide.id === 'start') {
        // a new show, also after a restart of the quiz
        qx['randomOrder.played'] = '[]';
    }

    if (slide.class === poolClass)
        qx['questionNumber'] = 'Question ' + (played().length + 1) + ' of ' + questionsToPlay;
}

// Quiz Show asks where to go after this slide
//   currentSlideNumber - the number of this slide, starting at 0
// Return a slide number, '#id' of a slide, or nothing to just go to the next slide.
function onNextSlide(currentSlideNumber) {
    const slide = qx.slide;
    if (slide.id === 'end')
        return;

    const done = played();
    if (slide.class === poolClass && !done.includes(currentSlideNumber))
        done.push(currentSlideNumber);
    qx['randomOrder.played'] = JSON.stringify(done);

    if (done.length >= questionsToPlay)
        return endSlide;

    // the questions of the pool that were not played yet
    const left = qx.slides.filter(s => s.class === poolClass && !done.includes(s.slideNumber));
    if (left.length === 0) {
        console.warn('The pool has only ' + done.length + ' questions, not ' + questionsToPlay);
        return endSlide;
    }

    const next = left[Math.floor(Math.random() * left.length)];
    console.log('Next: question ' + (done.length + 1) + ', slide ' + (next.slideNumber + 1) + ': ' +
        next.question);
    return next.slideNumber;
}
