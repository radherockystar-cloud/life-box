// Sab ID cards yaha localStorage me save hote hain.
// Future me agar backend/server pe save karna ho, to sirf isi file ke functions ko badalna padega — baaki app waisa hi chalega.

const STORAGE_KEY = 'idCards_v1';

export function getAllCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Cards load nahi ho paaye:', e);
    return [];
  }
}

export function saveCard(card) {
  const cards = getAllCards();
  const index = cards.findIndex((c) => c.id === card.id);
  if (index >= 0) {
    cards[index] = card; // existing card update
  } else {
    cards.push(card); // naya card add
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  return cards;
}

export function deleteCard(id) {
  const cards = getAllCards().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  return cards;
}
