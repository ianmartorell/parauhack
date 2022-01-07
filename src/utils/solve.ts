import { dict } from '../assets/dict';

export function solve({
  letters,
  mainLetter,
}: {
  letters: string[];
  mainLetter: string;
}) {
  const solution = [];
  for (const word of dict) {
    if (
      word.length >= 3 &&
      word.includes(mainLetter) &&
      word.split('').every((c) => letters.includes(c))
    ) {
      solution.push(word);
    }
  }
  return solution;
}
