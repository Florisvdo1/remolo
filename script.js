// Emoji Data
const EMOJIS = [
  { char: "🎨", category: "art", name: "artist palette" },
  { char: "🏖️", category: "travel", name: "beach" },
  { char: "🚀", category: "tech", name: "rocket" },
  { char: "🥑", category: "food", name: "avocado" },
  { char: "📅", category: "objects", name: "calendar" },
  { char: "🍕", category: "food", name: "pizza" },
  { char: "🎸", category: "art", name: "guitar" },
  { char: "🍎", category: "food", name: "apple" },
  { char: "🖌️", category: "art", name: "paintbrush" },
  { char: "📷", category: "tech", name: "camera" },
  { char: "✈️", category: "travel", name: "airplane" },
  { char: "🏰", category: "travel", name: "castle" },
  { char: "📱", category: "tech", name: "smartphone" },
  { char: "🛍️", category: "objects", name: "shopping bag" },
  { char: "🍔", category: "food", name: "burger" }
];

const deck = document.querySelector('.emoji-deck');
const homeworkBtn = document.querySelector('.homework-btn');
const searchInput = document.querySelector('.search-bar');
const categoryButtons = document.querySelectorAll('.cat-btn');
const addButtons = document.querySelectorAll('.add-btn');
const timeDisplay = document.querySelector('.time-display');

let draggedEmoji = null;
let dragSourcePlaceholder = null; // If dragging from a placeholder
let currentCategory = 'all';
let filteredEmojis = EMOJIS.slice();

function getPlaceholders() {
  return document.querySelectorAll('.placeholder');
}

// Filter and Display Emojis
function filterEmojis() {
  const searchTerm = searchInput.value.toLowerCase();
  filteredEmojis = EMOJIS.filter(e => {
    const matchesCategory = (currentCategory === 'all' || e.category === currentCategory);
    const matchesSearch = e.name.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
  displayEmojis();
}

function displayEmojis() {
  deck.innerHTML = '';
  filteredEmojis.forEach(e => {
    const span = document.createElement('span');
    span.classList.add('emoji-item');
    span.textContent = e.char;
    span.setAttribute('aria-label', e.name);
    span.setAttribute('tabindex', '0');
    span.addEventListener('touchstart', onTouchStartFromDeck);
    deck.appendChild(span);
  });
}

// Category Button Handlers
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentCategory = btn.dataset.category;
    filterEmojis();
  });
});

// Search Input Handler
searchInput.addEventListener('input', filterEmojis);

// Touch Start from Deck
function onTouchStartFromDeck(e) {
  startDragging(e, false);
}

// Touch Start from Placeholder Emoji
function onTouchStartFromPlaceholder(e) {
  const placeholder = e.target.closest('.placeholder');
  if (placeholder && !placeholder.classList.contains('empty')) {
    dragSourcePlaceholder = placeholder;
    startDragging(e, true, placeholder);
  }
}

function startDragging(e, fromPlaceholder, placeholder = null) {
  const target = e.target;
  if (!target.classList.contains('emoji-item')) return;

  if (navigator.vibrate) navigator.vibrate(10);

  draggedEmoji = target.cloneNode(true);
  draggedEmoji.classList.add('dragging');
  document.body.appendChild(draggedEmoji);

  const initialTouch = e.touches[0];

  const moveAt = (pageX, pageY) => {
    draggedEmoji.style.left = `${pageX - draggedEmoji.offsetWidth / 2}px`;
    draggedEmoji.style.top = `${pageY - draggedEmoji.offsetHeight / 2}px`;
  };
  
  moveAt(initialTouch.pageX, initialTouch.pageY);

  const touchMoveHandler = (event) => {
    const touch = event.touches[0];
    moveAt(touch.pageX, touch.pageY);
    checkMagnetEffect(touch);
  };

  const touchEndHandler = (event) => {
    dropEmoji(event, fromPlaceholder);
    draggedEmoji.remove();
    draggedEmoji = null;
    dragSourcePlaceholder = null; 
    document.removeEventListener('touchmove', touchMoveHandler);
    document.removeEventListener('touchend', touchEndHandler);
  };

  document.addEventListener('touchmove', touchMoveHandler, {passive: false});
  document.addEventListener('touchend', touchEndHandler, {passive: false});
}

function checkMagnetEffect(touch) {
  let magnetDetected = false;
  let placeholders = getPlaceholders();
  placeholders.forEach(placeholder => {
    const rect = placeholder.getBoundingClientRect();
    const distance = Math.hypot(
      touch.clientX - (rect.left + rect.width / 2),
      touch.clientY - (rect.top + rect.height / 2)
    );
    if (distance < 80) {
      placeholder.classList.add('highlight');
      draggedEmoji.classList.add('magnet');
      magnetDetected = true;
    } else {
      placeholder.classList.remove('highlight');
    }
  });
  if (!magnetDetected) {
    draggedEmoji.classList.remove('magnet');
  }
}

// Drop Emoji
function dropEmoji(event, fromPlaceholder) {
  if (navigator.vibrate) navigator.vibrate(20);

  const touch = event.changedTouches[0];
  let placeholders = getPlaceholders();
  let chosenPlaceholder = null;
  let minDistance = Infinity;

  placeholders.forEach(placeholder => {
    const rect = placeholder.getBoundingClientRect();
    const distance = Math.hypot(
      touch.clientX - (rect.left + rect.width / 2),
      touch.clientY - (rect.top + rect.height / 2)
    );
    if (distance < 80 && distance < minDistance) {
      minDistance = distance;
      chosenPlaceholder = placeholder;
    }
    placeholder.classList.remove('highlight');
  });

  if (chosenPlaceholder) {
    // Successfully dropped on chosenPlaceholder
    if (fromPlaceholder && dragSourcePlaceholder) {
      clearPlaceholder(dragSourcePlaceholder);
    }
    placeEmojiInPlaceholder(chosenPlaceholder, draggedEmoji.textContent);
  } else {
    // Dropped outside any placeholder
    if (fromPlaceholder && dragSourcePlaceholder) {
      placeEmojiInPlaceholder(dragSourcePlaceholder, draggedEmoji.textContent);
    }
  }
}

function clearPlaceholder(placeholder) {
  placeholder.innerText = '';
  placeholder.classList.add('empty');
  placeholder.setAttribute('aria-label', 'Empty placeholder');
}

function placeEmojiInPlaceholder(placeholder, emojiChar) {
  placeholder.innerHTML = ''; // Clear any existing content
  placeholder.classList.remove('empty');
  placeholder.setAttribute('aria-label', 'Contains emoji ' + emojiChar);
  const emojiSpan = document.createElement('span');
  emojiSpan.classList.add('emoji-item');
  emojiSpan.textContent = emojiChar;
  emojiSpan.setAttribute('aria-label', 'Re-draggable emoji ' + emojiChar);
  emojiSpan.setAttribute('tabindex', '0');
  emojiSpan.addEventListener('touchstart', onTouchStartFromPlaceholder);
  placeholder.appendChild(emojiSpan);
}

// Homework Button Toggle
homeworkBtn.addEventListener('click', () => {
  homeworkBtn.classList.toggle('green');
  homeworkBtn.textContent = homeworkBtn.classList.contains('green') ? 'Homework 👍' : 'Homework';
});

// Add New Placeholder
function addPlaceholderRow(btn) {
  const row = btn.parentElement;
  const newPlaceholder = document.createElement('div');
  newPlaceholder.classList.add('placeholder', 'empty');
  newPlaceholder.setAttribute('aria-label', 'Empty placeholder');
  newPlaceholder.setAttribute('tabindex', '0');
  row.insertBefore(newPlaceholder, btn);
}

addButtons.forEach(addBtn => {
  addBtn.addEventListener('click', () => {
    addPlaceholderRow(addBtn);
  });
});

// Time Display Update
function updateTime() {
  const now = new Date();
  timeDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateTime, 1000);
updateTime();

// Initial Display
filterEmojis();
