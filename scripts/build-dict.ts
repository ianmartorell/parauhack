import fs from 'fs';
import pdf from 'pdf-parse';
import unidecode from 'unidecode';

/**
 * Generates all the possible female version of a given male word and its female suffix. We
 * don't know where exactly to cut the male word to append the female suffix since we would
 * need to use grammatical rules of strong syllables to find the right vowel. Instead, we
 * bruteforce all possible combinations.
 *
 * @param male Male version of the word
 * @param femaleSuffix Suffix to create the female version. May or may not start with `-`
 * @returns An array with all the possible female versions of the word
 */
function makeFemales(male: string, femaleSuffix: string) {
  if (femaleSuffix[0] !== '-') {
    // If the suffix does not start with `-`, it's not really a suffix but the whole word
    return [femaleSuffix];
  }

  if (femaleSuffix.length === 2) {
    // If the suffix is a single letter, replace it or append it
    if (['e', 'o'].includes(male[male.length - 1])) {
      // If male word ends in 'e' or 'o', the female suffix substitutes the last letter
      return [`${male.substring(0, male.length - 1)}${femaleSuffix[1]}`];
    }
    // Otherwise, it gets appended
    return [`${male}${femaleSuffix[1]}`];
  }

  // Otherwise, find the first letter of the suffix in the male word
  // to create all the possibilitites.
  const asciiMale = unidecode(male);
  const asciiFemaleSuffix = unidecode(femaleSuffix).replace('-', '');
  const regex = new RegExp(asciiFemaleSuffix[0], 'g');
  const matches = asciiMale.matchAll(regex);
  const females = [];
  for (const match of matches) {
    females.push(`${male.substring(0, match.index)}${femaleSuffix.substring(1)}`);
  }
  return females;
}

/**
 * Extracts all words from the Catalan dictionary and saves them to a JSON file.
 *
 * @param pdfPath Path to a PDF file of Gran Diccionari de la Llengua Catalana
 * @param outputPath Where to save the generated JSON file
 * @param removeTildes Whether to remove tildes from extracted words
 */
async function buildDict(
  pdfPath: string,
  outputPath: string,
  removeTildes: boolean = false
) {
  const words = [];
  let dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  /**
   * We need to match all of the following:
   * ■\nu\n1\n\tnua\n
   * ■\nabecedari\n
   * ■\nabecedari\n2\n\t-ària\n
   * ■\nabegot\n
   * ■\nabelià\t-ana\n
   */
  const matches = data.text.matchAll(
    /■\n(?<word>[A-Za-zÀ-ÖØ-öø-ÿ·]*(\n\d\n)?(\t-?[A-Za-zÀ-ÖØ-öø-ÿ·]*)?)\n/g
  );
  for (const match of matches) {
    const word = match.groups['word'].replace(/\n\d\n/, '');
    console.log(word);
    const [male, femaleSuffix] = word.split('\t');
    words.push(removeTildes ? unidecode(male) : male);
    if (femaleSuffix) {
      const females = makeFemales(male, femaleSuffix);
      console.log(`  (${females})`);
      words.push(...(removeTildes ? females.map(unidecode) : females));
    }
  }
  // Remove duplicates and sort dictionary
  const uniqueWords = words.filter((w, i) => words.indexOf(w) === i).sort();
  console.log(uniqueWords);
  // Write output file
  const json = JSON.stringify({ diccionari: uniqueWords });
  await new Promise((resolve) => {
    fs.writeFile(outputPath, json, 'utf-8', resolve);
  });
}

const startTime = Date.now();
buildDict('diec.pdf', 'src/assets/dict.json').then(() => {
  const msElapsed = Date.now() - startTime;
  console.log(`Finished in ${msElapsed / 1000}s`);
});
