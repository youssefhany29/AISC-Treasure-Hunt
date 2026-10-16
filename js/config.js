// Organizer settings. See README before changing puzzle definitions.
export const CONFIG = Object.freeze({
  GAME_TITLE: 'THE LOST DESTINATION',
  CASE_NUMBER: '02',
  DESTINATION_NAME: 'SPOR SALONU',
  NEXT_LOCATION_URL: '',
  NEXT_LOCATION_URL_VERIFIED: false,
  ENABLE_SOUND: true,
  ENABLE_HINTS: true,
  ENABLE_ANIMATIONS: true,
  SHOW_PROGRESS: true,
  ALLOW_RESTART: true,
  STORAGE_VERSION: 1,
  STORAGE_NAMESPACE: 'treasureHunt.case02',
  evidence: [
    { id: 'receipt', name: 'Cafe receipt', symbol: '▲', value: '8', action: 'Unfold the receipt', sound: 'paper', image: 'assets/images/evidence/receipt.svg', note: 'Between the order and the total, someone left a different kind of tip.' },
    { id: 'cup', name: 'Coffee cup', symbol: '●', value: '3', action: 'Lift the coffee cup', sound: 'pickup', image: 'assets/images/evidence/cup.svg', note: 'A cold cup. A fresh mark. The informant wanted you to look underneath.' },
    { id: 'napkin', name: 'Folded napkin', symbol: '■', value: '6', action: 'Unfold the napkin', sound: 'unfold', image: 'assets/images/evidence/napkin.svg', note: 'Folded twice to keep a small secret safe.' },
    { id: 'coaster', name: 'Drink coaster', symbol: '★', value: '1', action: 'Flip the drink coaster', sound: 'flip', image: 'assets/images/evidence/coaster.svg', note: 'On the reverse, a star and a single number. The last piece of the cipher.' }
  ],
  lockOrder: ['napkin', 'receipt', 'coaster', 'cup'],
  puzzle: {
    version: 2,
    columns: 2,
    rows: 3,
    source: 'assets/images/puzzle/indoor-sports-hall.png',
    image: 'assets/images/puzzle/evidence-frame.png',
    pieces: [
      { id: 'k7', label: 'K7', slot: 0, image: 'assets/images/puzzle/tiles/tile-01.png' },
      { id: 'm2', label: 'M2', slot: 1, image: 'assets/images/puzzle/tiles/tile-02.png' },
      { id: 'r9', label: 'R9', slot: 2, image: 'assets/images/puzzle/tiles/tile-03.png' },
      { id: 'c4', label: 'C4', slot: 3, image: 'assets/images/puzzle/tiles/tile-04.png' },
      { id: 'n6', label: 'N6', slot: 4, image: 'assets/images/puzzle/tiles/tile-05.png' },
      { id: 'f1', label: 'F1', slot: 5, image: 'assets/images/puzzle/tiles/tile-06.png' }
    ]
  },
  doors: [
    { id: 'A', title: 'LIBRARY', image: 'assets/images/completion/door-library.svg', feedback: 'A library has lines of books, but no teams compete on a court. Look again at the recovered photo.' },
    { id: 'B', title: 'FITNESS GYM', image: 'assets/images/completion/door-gym.svg', feedback: 'A fitness gym has equipment, but the recovered photo shows a team court and spectator stands.' },
    { id: 'C', title: 'OUTDOOR FIELD', image: 'assets/images/completion/door-field.svg', feedback: 'The riddle says teams compete beneath a roof. Find the indoor venue.' },
    { id: 'D', title: 'INDOOR SPORTS HALL', image: 'assets/images/completion/door-hall.svg', feedback: '' }
  ],
  correctDoor: 'D',
  assets: {
    logo: 'assets/images/aisc-logo.png',
    dossier: 'assets/images/ui/dossier.svg',
    desk: 'assets/images/cafe/desk.svg',
    blueprint: 'assets/images/puzzle/indoor-sports-hall.png',
    hall: 'assets/images/completion/sports-hall.svg',
    paper: 'assets/images/ui/paper.png'
  },
  sounds: {
    tap: 'assets/sounds/ui-click.wav', discover: 'assets/sounds/clue-reveal.wav',
    paper: 'assets/sounds/paper-slide.wav', unfold: 'assets/sounds/paper-rustle.wav',
    pickup: 'assets/sounds/evidence-select.wav', flip: 'assets/sounds/case-close.wav',
    keypad: 'assets/sounds/ui-click.wav', error: 'assets/sounds/answer-error.wav',
    correct: 'assets/sounds/puzzle-success.wav', unlock: 'assets/sounds/lock-click.wav',
    folder: 'assets/sounds/case-open.wav', select: 'assets/sounds/evidence-select.wav',
    place: 'assets/sounds/tile-place.wav', blueprint: 'assets/sounds/puzzle-success.wav', final: 'assets/sounds/puzzle-success.wav'
  },
  text: {
    introLines: ["We've been expecting you.", "You're standing exactly where the informant was last seen.", 'Your contact has disappeared, but left behind a locked investigation file.', 'Follow the evidence. Recover the missing destination.'],
    cafeTitle: 'THE CAFE EVIDENCE',
    cafeObjective: 'Four clues are hidden in this scene. Inspect the objects. Recover the evidence.',
    lockTitle: 'CRACK THE CODE',
    lockObjective: 'The informant left a cipher. Follow the symbols on the lock to open the case.',
    blueprintTitle: 'THE MISSING PHOTOGRAPH',
    blueprintObjective: 'Six pieces. One missing place. Drag the pieces into the correct positions to rebuild the image.',
    deductionTitle: 'ONE FINAL QUESTION',
    riddle: ['I have lines, but I am not a road.', 'I have scores, but I am not a classroom.', 'I hear cheers, but I am not a theater.', 'Teams compete beneath my roof.'],
    completeTitle: 'MISSION COMPLETE',
    completeMessage: "You've recovered the missing destination.",
    nextClue: 'The next clue awaits you at the sports hall.',
    continueMessage: 'Your adventure continues!',
    hints: {
      intro: 'Begin at the cafe. Every object the informant left behind may matter.',
      cafe: 'Some objects can be lifted, flipped, or unfolded.',
      lock: 'Match the recovered symbols to the numbers, then follow the order shown on the lock.',
      blueprint: 'Drag the pieces into the correct positions to rebuild the image. Match the court lines, railings, and edges of the evidence frame.',
      deduction: 'Look for the place with court lines, spectator stands, a scoreboard, and a roof.'
    }
  }
});
// Deriving the code keeps clue values and lock validation consistent.
export const correctCode = () => CONFIG.lockOrder.map(id => CONFIG.evidence.find(e => e.id === id).value).join('');
export const storageKey = `${CONFIG.STORAGE_NAMESPACE}.v${CONFIG.STORAGE_VERSION}`;
export const pieceOrder = CONFIG.puzzle.pieces.map(piece => piece.id);
export function verifiedNextURL() {
  if (!CONFIG.NEXT_LOCATION_URL_VERIFIED || !CONFIG.NEXT_LOCATION_URL) return null;
  try { const u = new URL(CONFIG.NEXT_LOCATION_URL); return u.protocol === 'https:' ? u.href : null; } catch { return null; }
}
