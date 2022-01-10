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

function parseWord(word: string, removeTildes: boolean = false) {
  const result = [];
  const [male, femaleSuffix] = word.split('\t');
  result.push(removeTildes ? unidecode(male) : male);
  if (femaleSuffix) {
    const females = makeFemales(male, femaleSuffix);
    console.log(`  (${females})`);
    result.push(...(removeTildes ? females.map(unidecode) : females));
  }
  return result;
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
   * ■\nabelià\t-ana\n
   * ■\nnul\tnul·la\n
   * ■\nmeu\n2\n\tmeva\t[o\tmeua]\n
   */
  console.log(JSON.stringify(data.text));
  const matches = data.text.matchAll(
    /■\n(?<word>[A-Za-zÀ-ÖØ-öø-ÿ·]*(?:\n\d\n)?(?:\t-?[A-Za-zÀ-ÖØ-öø-ÿ·]*)?)(?<variants>\t\[(?:o\t-?[A-Za-zÀ-ÖØ-öø-ÿ·]*(?:\t-[A-Za-zÀ-ÖØ-öø-ÿ·]*)?\t*)*\])*\n/g
  );
  for (const match of matches) {
    const word = match.groups['word'].replace(/\n\d\n/, '');
    const variants = match.groups['variants'];
    console.log('word', word);
    console.log('variants', JSON.stringify(variants));
    words.push(...parseWord(word, removeTildes));
    if (variants) {
      const matches = variants.matchAll(
        /o\t(?<variant>-?[A-Za-zÀ-ÖØ-öø-ÿ·]*(?:\t-?[A-Za-zÀ-ÖØ-öø-ÿ·]*)?)(?:\t|\])?/g
      );
      for (const match of matches) {
        const variant = match.groups['variant'];
        if (variant.startsWith('-')) {
          // If the variant starts with `-` it's just the female suffix, not the whole word
          const male = word.split('\t')[0];
          words.push(...parseWord(male + '\t' + variant));
        } else {
          // Otherwise it's the whole word, and it may or may not have a female suffix
          words.push(...parseWord(variant));
        }
      }
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
