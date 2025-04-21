/**
 * Interactive Game Rating Recorder
 * Author: Zichen Jiang (mtjqmszb)
 * This script enables adding, editing, deleting, and sorting personal game entries.
 * Entries include game name, rating (0–10), start date, and optional review.
 * Data is stored in localStorage and displayed using innerHTML rendering.
 */

// DOM Elements
const gameForm = document.querySelector('#gameForm');
const gameNameInput = document.querySelector('#gameName');
const gameRatingInput = document.querySelector('#gameRating');
const startDateInput = document.querySelector('#startDate');
const reviewNotesInput = document.querySelector('#reviewNotes');
const gameListContainer = document.querySelector('#gameListContainer');
const sortSelect = document.querySelector('#sortSelect');

// Error message elements for validation feedback
const nameError = document.querySelector('#nameError');
const ratingError = document.querySelector('#ratingError');
const dateError = document.querySelector('#dateError');

// Load game list from localStorage or initialize empty list
let gameList = JSON.parse(localStorage.getItem('gameList')) || [];

// ID of game currently being edited (null if adding new)
let editingId = null;

/**
 * Formats a date string into a readable display format.
 * @param {string} dateStr - ISO date string
 * @returns {string} - Formatted date (e.g., "Mon, Apr 1, 2024")
 */
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/**
 * Saves the current game list to localStorage.
 */
const saveGames = () => {
  localStorage.setItem('gameList', JSON.stringify(gameList));
};

/**
 * Renders all game entries sorted by the selected method (name, rating, date).
 * Uses innerHTML to update the DOM.
 */
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

/**
 * Validates user input and returns a game object if valid.
 * If not valid, displays inline error messages and returns null.
 * @returns {Object|null} Game object with name, rating, date, review, and ID
 */
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

/**
 * Handles form submission. Adds new game or updates existing one based on editingId.
 * Resets the form and re-renders the game list.
 */
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

/**
 * Handles clicks on "Edit" and "Delete" buttons.
 * Edit pre-fills form with game info. Delete removes entry.
 */
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

/**
 * Triggers re-render of games whenever sorting option changes.
 */
sortSelect.addEventListener('change', renderGames);

// Initial page render
renderGames();
