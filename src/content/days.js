// Inhoud van de luikjes. Elk luikje heeft een type:
//
//   text  – een boodschap:      { type: 'text', title, text }
//   photo – foto met tekst:     { type: 'photo', title, image, alt, caption }
//           (zet de foto in public/luikjes/ en gebruik bv. image: '/luikjes/dag2.jpg';
//            zonder image wordt een placeholder getoond)
//   quiz  – mini-spelletje:     { type: 'quiz', title, question, options: [...], answer, explanation }
//           (answer = index van het juiste antwoord, beginnend bij 0)
//
// Dagen die hier nog niet staan, tonen "Wat hier in zit, volgt binnenkort…".

export const DAYS = {
  1: {
    type: 'text',
    title: 'Welkom in december!',
    text: 'Dit is een placeholder voor het eerste luikje. Hier komt straks een lieve boodschap, een gedichtje of een leuk weetje.',
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
