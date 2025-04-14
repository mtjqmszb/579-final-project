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

  if (sortSelect.value === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortSelect.value === 'rating') {
    sorted.sort((a, b) => b.rating - a.rating);  
  } else if (sortSelect.value === 'date') {
    sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  gameListContainer.innerHTML = sorted.map(game => `
    <div class="game-card">
      <div class="game-header">
        <h3>${game.name}</h3>
        <small>${formatDate(game.date)}</small>
      </div>
      <p>Rating: ${game.rating}/10</p>
      <p>${game.review || ''}</p>
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
    id: Date.now(),
    name,
    rating,
    date,
    review
  } : null;
};

// Add game
gameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newGame = getValidatedGame();
  if (!newGame) return;

  gameList.push(newGame);
  saveGames();
  renderGames();
  gameForm.reset();
});

// Delete game
gameListContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = Number(e.target.dataset.id);
    gameList = gameList.filter(game => game.id !== id);
    saveGames();
    renderGames();
  }
});

// Sort change
sortSelect.addEventListener('change', renderGames);

// Initial render
renderGames();
