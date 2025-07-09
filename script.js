document.addEventListener('DOMContentLoaded', () => {
  const API_KEY = '681d2f88'; 

  const searchInput = document.getElementById('searchInput');
  const movieResults = document.getElementById('movieResults');
  const watchlistContainer = document.getElementById('watchlist');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');
  const htmlEl = document.documentElement;

  let debounceTimer;
  let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

  // Update icon and label
  function updateThemeUI(isDark) {
    themeIcon.textContent = isDark ? "🌙" : "🌞";
    themeLabel.textContent = isDark ? "" : "";
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  const isDark = savedTheme !== 'light';
  htmlEl.classList.toggle('dark', isDark);
  updateThemeUI(isDark);

  //  Theme toggle button
  themeToggle.addEventListener('click', () => {
    const isDarkMode = htmlEl.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeUI(isDarkMode);
  });

  //  Debounced search input
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        fetchMovies(query);
      } else {
        movieResults.innerHTML = '';
      }
    }, 500);
  });

  //  Fetch movies from OMDb
  async function fetchMovies(query) {
    const res = await fetch(`https://www.omdbapi.com/?s=${query}&type=movie&apikey=${API_KEY}`);
    const data = await res.json();
    if (data.Response === 'True') {
      displayMovies(data.Search.slice(0, 10));
    } else {
      movieResults.innerHTML = `<p class="col-span-full text-center text-red-500">${data.Error}</p>`;
    }
  }

  //  Display movie cards
  function displayMovies(movies) {
    movieResults.innerHTML = '';
    movies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 flex flex-col shadow-lg hover:scale-105 transition';

      card.innerHTML = `
        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}"
             alt="${movie.Title}" class="rounded mb-3 h-64 object-cover w-full">
        <h3 class="text-lg font-bold mb-1">${movie.Title}</h3>
        <p class="text-sm text-gray-400 mb-2">${movie.Year}</p>
        <button class="add-watchlist-btn mt-auto bg-red-600 dark:bg-red-500 text-white px-3 py-2 rounded hover:bg-red-700 dark:hover:bg-red-600 transition" 
                data-id="${movie.imdbID}">
          + Watchlist
        </button>
      `;
      movieResults.appendChild(card);
    });

    document.querySelectorAll('.add-watchlist-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addToWatchlist(btn.getAttribute('data-id'));
      });
    });
  }

  //  Add to watchlist
  function addToWatchlist(imdbID) {
    if (!watchlist.includes(imdbID)) {
      watchlist.push(imdbID);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      renderWatchlist();
    }
  }

  //  Render watchlist
  async function renderWatchlist() {
    watchlistContainer.innerHTML = '';
    for (let id of watchlist) {
      const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`);
      const movie = await res.json();

      const card = document.createElement('div');
      card.className = 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 flex flex-col shadow-lg';

      card.innerHTML = `
        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}"
             alt="${movie.Title}" class="rounded mb-3 h-64 object-cover w-full">
        <h3 class="text-lg font-bold mb-1">${movie.Title}</h3>
        <p class="text-sm text-gray-400 mb-2">${movie.Year}</p>
        <button class="remove-watchlist-btn bg-red-700 text-white px-3 py-2 rounded hover:bg-red-800 transition mt-auto"
                data-id="${movie.imdbID}">
          ❌ Remove
        </button>
      `;
      watchlistContainer.appendChild(card);
    }

    document.querySelectorAll('.remove-watchlist-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const imdbID = btn.getAttribute('data-id');
        watchlist = watchlist.filter(id => id !== imdbID);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        renderWatchlist();
      });
    });
  }

 
  renderWatchlist();
});
