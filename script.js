const letters = document.querySelectorAll(".board-letter");

const loadingDiv = document.querySelector(".loading-bar");
const ANSWER_LENGTH = 5;
const MAX_ROW = 6;
let done = false;
let loading = true;
let currentRow = 0;
async function init() {
  let currentGuess = "";

  // new word everytime
  const res = await fetch(
    "https://words.dev-apis.com/word-of-the-day?random=1"
  );

  // new word everyday
  //   const res = await fetch("https://words.dev-apis.com/word-of-the-day");

  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split("");

  setLoading(false);

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      // replace the last letter
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    // show the letter in its tile in the current row
    letters[currentGuess.length - 1 + ANSWER_LENGTH * currentRow].innerText =
      letter;
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentGuess.length + ANSWER_LENGTH * currentRow].innerText = "";
  }

  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      // do nothing
      return;
    }

    // TODO validate the word
    setLoading(true);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });

    const resObj = await res.json();
    const validWord = resObj.validWord;
    // const { validWord } = resObj;

    setLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    // do all the marking "correct", "close", "wrong"
    let map = makeMap(wordParts);
    const guessParts = currentGuess.split("");
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      // mark as correct
      if (guessParts[i] == wordParts[i]) {
        letters[i + ANSWER_LENGTH * currentRow].classList.add("correct");
        map[wordParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      // mark as correct
      if (guessParts[i] == wordParts[i]) {
        // do nothing, already did
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] != 0) {
        letters[i + ANSWER_LENGTH * currentRow].classList.add("close");
        map[guessParts[i]]--;
      } else {
        letters[i + ANSWER_LENGTH * currentRow].classList.add("wrong");
      }
    }

    // TODO did they win?
    if (currentGuess == word) {
      alert("you win");
      done = true;
      return;
    }

    currentRow++;
    if (currentRow === MAX_ROW) {
      alert(`you lose, the word was ${word}`);
      done = true;
      return;
    }
    currentGuess = "";
  }

  function makeMap(array) {
    let obj = {};

    for (let i = 0; i < array.length; i++) {
      const letter = array[i];

      if (obj[letter]) {
        obj[letter]++;
      } else {
        obj[letter] = 1;
      }
    }

    return obj;
  }

  document.addEventListener("keydown", function handleKeyPress(event) {
    const action = event.key;

    if (done || loading) {
      return;
    }

    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      // do nothing
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loading = isLoading;
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function markInvalidWord() {
  for (let i = 0; i < ANSWER_LENGTH; i++) {
    letters[i + ANSWER_LENGTH * currentRow].classList.remove("invalid");

    setTimeout(function () {
      letters[i + ANSWER_LENGTH * currentRow].classList.add("invalid");
    }, 10);
  }
}

init();
