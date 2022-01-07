import { getLetters, submitSolution, createElementFromHTML } from './utils/dom';
import { solve } from './utils/solve';

const solveButtonHtml = `<button id="solve-link" type="button" class="icon" title="Solucionar" style="margin-right: 5px"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></button>`;
const solveButton = createElementFromHTML(solveButtonHtml);

if (!solveButton) throw new Error('Could not create button element');

solveButton.addEventListener('click', () => {
  const { letters, mainLetter } = getLetters();
  const solution = solve({ letters, mainLetter });
  submitSolution(solution);
});

const nav = document.querySelector('.nav-container nav');
if (!nav) throw new Error('Could not find nav');

nav.prepend(solveButton);
