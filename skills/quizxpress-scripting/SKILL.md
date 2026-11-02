---
name: quizxpress-scripting
description: Write, add and debug JavaScript slide scripts in QuizXpress quizzes (.qx) through the QuizXpress MCP, either the MCP inside a running Quiz Studio (http://127.0.0.1:8766/mcp) or the stand-alone QuizXpress MCP. Use whenever a slide should do something at show time - a timer or clock on the screen, going to another slide automatically, reacting to the countdown, votes, buzzers or scores, bonus points, random or conditional slide order, values shown with [jsvar.name], questions fetched from the web, music, or sending UDP/TCP/OSC to lighting and other equipment - even when the user does not say "script".
---

# QuizXpress slide scripts

A slide in QuizXpress can carry a JavaScript (its `Script` property). Quiz Show (QuizXpress Live)
runs it while it shows that slide: first the top-level code, then `onLoadSlide()`, then the other
handlers as events happen; `onUnloadSlide()` when the slide is left. The engine is **Jint 4.2**
inside QuizXpress, not a browser and not Node.

This skill is about writing such scripts and putting them in a quiz with the MCP. For building
slides, styles and content in general, use the `quizxpress` skill.

- `references/api.md` - every handler, object, property and function a script can use. Read it
  before you write anything beyond a trivial script; do not invent API.
- `references/patterns.md` - proven recipes (countdown timer that goes on by itself, end of the
  question exactly once, values across slides, routing, fetch, scores, music, OSC).
- Working example quizzes, each with its `.js` and a README:
  `https://github.com/gameshowcrew/samples/tree/main/script` (the `script` folder next to this
  skill in the samples repo).
- User manual: `https://docs.quizxpress.com/advanced/scripting/`.

## Workflow

### 1. Find the slide

```json
quiz        { "action": "list_slides" }
studio      { "action": "status" }            // Studio only: file, dirty flag, open dialogs
quiz        { "action": "info" }              // sourceSize = slide size in pixels, e.g. 1600x900
```

Users count slides from 1 ("slide 2"), the MCP from 0 (`session.store.slides[1]`). Check the type
in the list (`[Wager]`, `[Billboard]`...) to be sure you have the slide they mean, and say which one
you changed.

### 2. Read what is there

```json
model_node  { "action": "get_property", "path": "session.store.slides[1]", "property": "Script" }
model_collection { "action": "list", "path": "session.store.slides[1].items" }
```

A slide can already have a script. Extend it instead of overwriting it, or ask. Look at the items
to see where there is room for a text box, and `quiz slide_preview` (`slideIndex`, `width` 640)
to see the slide.

### 3. Write the script in a local file first

Write it to a `.js` file in a scratch folder, so you can check it and the user can read it:

- Follow the structure of the editor's template: a comment header that says what the script does
  and which `[jsvar...]` text boxes the slide needs, settings as `const` at the top, then the
  handlers, then helper functions.
- Use only the API in `references/api.md`.
- Check the syntax: `node --check script.js`. That catches syntax errors; it knows nothing about
  the QuizXpress API, so check every `qx`/`slide`/`player` member against `references/api.md`.

### 4. Put it on the slide

```json
model_node {
  "action": "set_property",
  "path": "session.store.slides[1]",
  "property": "Script",
  "value": "<the whole script>"
}
```

- Send the script with CRLF line ends (Windows, what the script editor writes).
- The value replaces the whole script. To remove a script, set an empty string.
- Read it back with `get_property` to confirm.
- In Quiz Studio every change clears the undo history and the user sees it at once; Studio
  refuses calls while a dialog is open (`studio status` lists them).

### 5. Show values on the slide

A script shows text on the screen only through `qx['name'] = value` plus a text item on the slide
containing `[jsvar.name]`. The text redraws as soon as the value changes, also from a timer. The
symbol works in any text item (a text box, the question, an answer), but a separate text box is
usually right:

```json
model_create {
  "action": "create",
  "profile": "TextShape@slide.items",
  "parentPath": "session.store.slides[1]",
  "text": "[jsvar.timer]",
  "x": 350, "y": 735, "width": 900, "height": 150,
  "fontName": "Segoe UI Semibold", "fontSize": 100
}
```

- `fontSize` is in pixels (default 50); the text is white and centred, without background. Change
  it afterwards with `set_property` on the returned `nodeId` (`TextColor`, `Font`, `Rect`,
  `BackgroundFill`...). `displayCondition`: `DisplayImmediate` (default), `DisplayAfterAnswer`,
  `HideAfterAnswer`, `Timed`, `Hidden`, `AfterBuzzed`.
- Coordinates are in slide pixels (`quiz info` -> `sourceSize`). Put the box in free space: list
  the items' `Rect`s first.
- In Studio the box shows the symbol itself (`[jsvar.timer]`); make it wide enough for the symbol
  or it looks clipped in the editor. In the show it shows the value.
- Set the value in the top-level code or `onLoadSlide()`, so the box is never empty when the
  slide appears.

### 6. Check, save, hand over

- `quiz slide_preview` the slide and look at it.
- Save only when the user wants it: `quiz save` (in Studio the user may prefer to save
  themselves). `quiz new/open/close` refuse unsaved changes unless `discardChanges` is true - never
  discard without asking.
- The MCP cannot run a script. Tell the user how to test it: in Studio open the slide's Script
  and click **Test** (runs the top-level code and `onLoadSlide()` with ten dummy teams; other
  handlers are not called, sound and navigation do nothing, the quiz does not change), then run the
  quiz in Quiz Show and watch the Director's **Script** button (the script console).
- Tell the user what the script does, what it needs on the slide, which settings to change, and
  what it does not handle.

## Rules that prevent most mistakes

**Lifetime**
- A script lives as long as its slide is shown. Its variables, handlers and `setInterval` timers
  are gone when the slide is left. Keep data that must survive in `qx['name']`.
- Every slide that needs a behaviour needs its own copy of the script.
- Up to QuizXpress 8.5, `setTimeout(fn, ms)` is **not** cancelled when the slide is left and
  there is no `clearTimeout`: a late callback can run after the show moved on. For a delay that may
  still be pending when the quiz master goes on (a delayed jump, a delayed sound), use a one-shot
  `setInterval` (see `references/patterns.md`). From 8.6 pending timeouts stop with the slide and
  `clearTimeout(id)` exists; ask which version the user runs if it matters.
- Stop music you started in `onUnloadSlide()`; the quiz master can leave at any moment.

**Values on the screen and across slides**
- `qx['name']` keeps its value until Quiz Show closes, also over a restart of the quiz. Reset what
  must start fresh in the script of the first slide.
- An unset `qx['name']` is `null`, so `qx['list'] || '[]'` works for a first default.
- Store text and numbers. Lists and objects: `JSON.stringify()` / `JSON.parse()`.
- Format numbers yourself before showing them (`toFixed()`, `padStart()`): a raw number is
  converted to text with the Windows regional settings (`0,5` on a Dutch PC).

**Navigation**
- `qx.sink.gotoSlide(n)` jumps to slide number `n` (0-based) from anywhere, also from a timer. It
  ignores the slide's 'Next slide' setting.
- To change where *next* goes, use `onNextSlide()` (only called when the slide has no 'Next slide'
  set): return a number, `'#slideId'` or a slide from `qx.slides`.
- `onCommandNext()` returning `true` swallows the quiz master's next; use it sparingly, the quiz
  master must never get stuck.
- Find slides by id or class (`SlideId` / `SlideClass` properties, 'Metadata' in Studio), not by a
  hard-coded number that breaks when slides are inserted. Set them with the MCP when needed.

**The end of a question**
- Depending on the question's settings Quiz Show calls `onEndCountdown(false)` and/or
  `onTimeout()`. Do end-of-question work in one function called from both, guarded by a flag (see
  `references/patterns.md`).
- `onEndCountdown(true)` means paused, not ended.

**Errors and the show**
- An error never stops the show, but the rest of that handler does not run. Errors go to the script
  console (Studio below the editor, the Director's Script button), never to the projected screen.
- Never use `alert()` in a script for a show (it blocks the whole show) and keep `sleep()` short
  (the show waits). Use `console.log()` / `warn()` / `error()`.
- Guard against missing data: `qx.leaderBoard[0]` can be undefined, `fetch()` can fail (wrap in
  `try`/`catch`), a team may have no `lastVote`.

**The engine**
- Modern JavaScript works: `let`/`const`, arrow functions, classes, template literals,
  destructuring, `async`/`await`, array methods, `padStart`, `JSON`, `Math`, `Date`.
- There is no browser or Node: no `document`, `window`, `localStorage`, `require`, `import`,
  `Promise`-based `response.json()`. `fetch(url)` returns `{ status, statusText, text }`; parse
  with `JSON.parse(response.text)`.
- Timer callbacks run on a background thread: keep them short. `qx.sink.gotoSlide()` passes the
  jump to the show's own thread, so it is fine to call from a timer.
- Windows paths in strings need doubled backslashes: `'C:\\Music\\tension.mp3'`.

**Changing the slide or scores**
- `slide.setQuestion()`, `setAnswers()`, `setCorrectAnswer()` change the slide for this show only,
  in `onLoadSlide()` (which may be `async` to `await fetch()`). `setAnswers()` cannot add answers.
- `player.score += n` changes a team's score (not on test questions).

## Hand-over example

> Added a script to slide 2 (the wager slide) and a text box `[jsvar.timer]` under the answers.
> The script counts down 15 seconds (`const seconds = 15` at the top) and then goes to slide 3.
> If you press next earlier, the timer stops. Not saved yet; test it with Test in the script
> editor and in Quiz Show (Director > Script for messages).
