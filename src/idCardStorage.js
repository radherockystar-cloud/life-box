const STORAGE_KEY = 'familyVault_v2';

export function getAllCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Data load nahi ho paya:', e);
    return [];
  }
}

export function saveCard(card) {
  const cards = getAllCards();
  const index = cards.findIndex((c) => c.id === card.id);
  if (index >= 0) {
    cards[index] = card;
  } else {
    cards.push(card);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  return cards;
}

export function deleteCard(id) {
  const cards = getAllCards().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  return cards;
}
