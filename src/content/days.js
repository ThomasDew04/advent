// Inhoud van de luikjes. Elk luikje heeft een type:
//
//   text  – een boodschap:      { type: 'text', title, text }
//   photo – foto met tekst:     { type: 'photo', title, image, alt, caption }
//           (zet de foto in src/images/, importeer hem bovenaan dit bestand en gebruik bv. image: clownie;
//            zonder image wordt een placeholder getoond)
//   quiz  – mini-spelletje:     { type: 'quiz', title, question, options: [...], answer, explanation }
//           (answer = index van het juiste antwoord, beginnend bij 0)
//
// Dagen die hier nog niet staan, tonen "Wat hier in zit, volgt binnenkort…".

import clownie from '../images/clownie.jpg'

export const DAYS = {
  1: {
    type: 'photo',
    title: 'Welkom in december!',
    image: clownie,
    alt: 'Een kleine clown met een rode neus, een papieren hoedje en een hartje op de wang',
    caption: 'Kom elke dag tot kerst terug voor een klein berichtje 🤗',
  },
  2: {
    type: 'photo',
    title: 'Een mooie herinnering',
    image: null,
    alt: '',
    caption: 'Placeholder: hier komt een foto met een korte tekst erbij.',
  },
  3: {
    type: 'quiz',
    title: 'Raad eens!',
    question: 'Placeholdervraag: hoeveel luikjes heeft deze adventskalender?',
    options: ['12', '24', '25', '31'],
    answer: 2,
    explanation: 'Juist! Van 1 tot en met 25 december.',
  },
}
