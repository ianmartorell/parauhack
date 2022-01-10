import unidecode from 'unidecode';
import dict from '../assets/dict.json';

export function solve({
  letters,
  mainLetter,
}: {
  letters: string[];
  mainLetter: string;
}) {
  console.log(
    `Buscant solució per a ${letters} entre ${dict.diccionari.length} paraules`
  );
  const solution = [];
  for (const word of dict.diccionari) {
    const asciiWord = unidecode(word).replace(/\*/g, ''); // The character `·` gets decoded to `*`
    if (
      asciiWord.length >= 3 &&
      asciiWord.includes(mainLetter) &&
      asciiWord.split('').every((c) => letters.includes(c))
    ) {
      solution.push(asciiWord);
    }
  }
  return solution;
}
