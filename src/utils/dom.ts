export function getLetters() {
  const hexQuery = document.querySelectorAll('.hex p');
  const letters = Array.from(hexQuery).map((h) => {
    const value = h.childNodes[0].nodeValue;
    if (!value) throw new Error('Could not get letter value');
    return value;
  });
  const mainLetter = letters[3]; // main letter is in the fourth position
  return { letters, mainLetter };
}

export function submitSolution(solution: string[]) {
  const input = document.getElementById('test-word');
  if (!input) throw new Error('Could not find input element');
  const submit = document.getElementById('submit-button');
  if (!submit) throw new Error('Could not find submit button element');
  solution.forEach((word) => {
    input.textContent = word;
    submit.click();
  });
}

export function createElementFromHTML(htmlString: string) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstElementChild;
}
