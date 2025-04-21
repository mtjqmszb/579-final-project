// DOM Elements
const gameForm = document.querySelector('#gameForm');
const gameNameInput = document.querySelector('#gameName');
const gameRatingInput = document.querySelector('#gameRating');
const startDateInput = document.querySelector('#startDate');
const reviewNotesInput = document.querySelector('#reviewNotes');
const gameListContainer = document.querySelector('#gameListContainer');
const sortSelect = document.querySelector('#sortSelect');

// Error message elements
const nameError = document.querySelector('#nameError');
const ratingError = document.querySelector('#ratingError');
const dateError = document.querySelector('#dateError');

// Load game list or start empty
let gameList = JSON.parse(localStorage.getItem('gameList')) || [];
let editingId = null;

// Helper: Format date
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

// Helper: Save list to localStorage
const saveGames = () => {
  localStorage.setItem('gameList', JSON.stringify(gameList));
};

// Render game list
const renderGames = () => {
  const sorted = [...gameList];
  const sortFunctions = {
    name: (a, b) => a.name.localeCompare(b.name),
    rating: (a, b) => b.rating - a.rating,
    date: (a, b) => new Date(a.date) - new Date(b.date)
  };
  sorted.sort(sortFunctions[sortSelect.value]);

  gameListContainer.innerHTML = sorted.map(game => `
    <div class="game-card">
      <div class="game-header">
        <h3>${game.name}</h3>
        <small>${formatDate(game.date)}</small>
      </div>
      <p>Rating: ${game.rating}/10</p>
      <p>${game.review || ''}</p>
      <button class="edit-btn" data-id="${game.id}">Edit</button>
      <button class="delete-btn" data-id="${game.id}">Delete</button>
    </div>
  `).join('');
};

// Validate form and return game object or null
const getValidatedGame = () => {
  let valid = true;
  const name = gameNameInput.value.trim();
  const rating = parseFloat(gameRatingInput.value);
  const date = startDateInput.value;
  const review = reviewNotesInput.value.trim();

  nameError.style.display = name ? 'none' : 'inline';
  ratingError.style.display = (rating >= 0 && rating <= 10) ? 'none' : 'inline';
  dateError.style.display = date ? 'none' : 'inline';

  if (!name) valid = false;
  if (isNaN(rating) || rating < 0 || rating > 10) valid = false;
  if (!date) valid = false;

  return valid ? {
    id: editingId ?? Date.now(),
    name,
    rating,
    date,
    review
  } : null;
};

// Handle form submit
gameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const game = getValidatedGame();
  if (!game) return;

  if (editingId) {
    gameList = gameList.map(g => g.id === editingId ? game : g);
    editingId = null;
  } else {
    gameList.push(game);
  }

  saveGames();
  renderGames();
  gameForm.reset();
});

// Delete or Edit game
gameListContainer.addEventListener('click', (e) => {
  const id = Number(e.target.dataset.id);
  if (e.target.classList.contains('delete-btn')) {
    gameList = gameList.filter(game => game.id !== id);
    saveGames();
    renderGames();
  }

  if (e.target.classList.contains('edit-btn')) {
    const game = gameList.find(g => g.id === id);
    if (game) {
      editingId = id;
      gameNameInput.value = game.name;
      gameRatingInput.value = game.rating;
      startDateInput.value = game.date;
      reviewNotesInput.value = game.review || '';
    }
  }
});

// Sort change
sortSelect.addEventListener('change', renderGames);

// Initial render
renderGames();
