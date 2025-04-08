// API Configuration
const TMDB_API_KEY = '557c35bbbe97da53f3bdfa06f11ff7de';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// DOM Elements
const trendingMovies = document.getElementById('trendingMovies');
const popularMovies = document.getElementById('popularMovies');
const topTVShows = document.getElementById('topTVShows');
const newReleases = document.getElementById('newReleases');
// const searchResults = document.getElementById('searchResults'); // Removed duplicate declaration
const movieModal = document.getElementById('movieModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close-modal');
const heroCarousel = document.getElementById('heroCarousel');

// Utility Functions
const fetchFromTMDB = async (endpoint, params = {}) => {
    const queryString = new URLSearchParams({
        api_key: TMDB_API_KEY,
        ...params
    }).toString();
    
    try {
        const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${queryString}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};

// Update the createMovieCard function
const createMovieCard = (movie) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const imageUrl = movie.poster_path 
        ? `${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}`
        : 'assets/images/placeholder.jpg';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${movie.title || movie.name}">
        <button class="watch-btn">
            <i class="fas fa-play"></i>
        </button>
        <div class="movie-info">
            <h3>${movie.title || movie.name}</h3>
            <div class="movie-meta">
                <div class="rating">
                    <i class="fas fa-star"></i>
                    ${movie.vote_average.toFixed(1)}
                </div>
                <span class="year">${(movie.release_date || movie.first_air_date || '').split('-')[0]}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `movie.html?id=${movie.id}&type=${movie.media_type || 'movie'}`;
    });
    
    return card;
};

// Feature: Content Sections
const initializeContentSection = async (endpoint, container) => {
    const data = await fetchFromTMDB(endpoint);
    if (!data?.results) return;
    
    data.results.forEach(item => {
        container.appendChild(createMovieCard(item));
    });
};

// Feature: Search Functionality
let searchTimeout;

// Update the search container HTML
document.querySelector('.nav-middle').innerHTML = `
    <div class="search-container">
        <form id="searchForm">
            <input type="text" id="searchInput" placeholder="Search movies & TV shows...">
            <button type="submit" class="search-btn"><i class="fas fa-search"></i></button>
        </form>
    </div>
    <div class="search-results" id="searchResults" style="display: none;"></div>
`;

// Get DOM elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Add form submit handler
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query.length >= 3) {
        window.location.href = `search-results.html?query=${encodeURIComponent(query)}`;
    }
});

// Add input handler for dropdown results
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 3) {
        searchResults.style.display = 'none';
        return;
    }

    searchTimeout = setTimeout(() => {
        handleSearch(query);
    }, 500);
});

// Update handleSearch function
const handleSearch = async (query) => {
    try {
        const data = await fetchFromTMDB('/search/multi', { query });
        if (!data?.results) return;

        const validResults = data.results
            .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
            .slice(0, 5);

        if (validResults.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        searchResults.innerHTML = validResults.map(item => `
            <div class="search-result-item" onclick="location.href='movie.html?id=${item.id}&type=${item.media_type}'">
                <img src="${TMDB_IMAGE_BASE_URL}/w92${item.poster_path}" alt="${item.title || item.name}">
                <div>
                    <h4>${item.title || item.name}</h4>
                    <p>${item.media_type} • ${(item.release_date || item.first_air_date || '').split('-')[0]}</p>
                </div>
            </div>
        `).join('');

        searchResults.style.display = 'block';
    } catch (error) {
        console.error('Error during search:', error);
    }
};

// Add click outside listener to close search results
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-middle')) {
        searchResults.style.display = 'none';
    }
});

// Feature: Movie Details Modal
const showMovieDetails = async (item) => {
    const endpoint = `/${item.media_type}/${item.id}`;
    const details = await fetchFromTMDB(endpoint);
    
    modalContent.innerHTML = `
        <div class="modal-header" style="background-image: url('${TMDB_IMAGE_BASE_URL}/original${details.backdrop_path}')">
            <div class="modal-header-content">
                <h2>${details.title || details.name}</h2>
                <button onclick="playContent('${details.id}', '${item.media_type}')">
                    Watch Now
                </button>
            </div>
        </div>
        <div class="modal-info">
            <p>${details.overview}</p>
            <div class="meta-info">
                <span>Rating: ★ ${details.vote_average.toFixed(1)}</span>
                <span>Release: ${details.release_date || details.first_air_date}</span>
                <span>Runtime: ${details.runtime || details.episode_run_time?.[0] || 'N/A'} min</span>
            </div>
        </div>
    `;
    
    movieModal.style.display = 'block';
};

// Feature: Video Player Integration
const playContent = (id, mediaType) => {
    const playerUrl = `https://vidsrc.to/embed/${mediaType}/${id}`;
    window.open(playerUrl, '_blank');
};

// Update the initHeroCarousel function
const initHeroCarousel = async () => {
    const data = await fetchFromTMDB('/trending/all/day');
    if (!data?.results) return;

    const trending = data.results.slice(0, 5);
    const heroCarousel = document.getElementById('heroCarousel');
    
    heroCarousel.innerHTML = trending.map((item, index) => `
        <div class="carousel-slide ${index === 0 ? 'active' : ''}" 
             data-movie-id="${item.id}"
             data-media-type="${item.media_type}"
             data-movie='${JSON.stringify(item)}'
             style="background-image: url('${TMDB_IMAGE_BASE_URL}/original${item.backdrop_path}')">
        </div>
    `).join('');

    // Update initial carousel info
    updateCarouselInfo(trending[0]);

    // Setup controls and start auto-scroll
    setupCarouselControls(trending);
    startAutoScroll(trending);
};

const updateCarouselInfo = (movie) => {
    const content = document.querySelector('.carousel-content');
    if (!content) return;

    content.innerHTML = `
        <div class="carousel-rating">
            <span class="imdb-rating">★</span>
            <span class="rating-value">${movie.vote_average.toFixed(1)}</span>
            <span class="year">${(movie.release_date || movie.first_air_date || '').split('-')[0]}</span>
        </div>
        <h2 class="carousel-title">${movie.title || movie.name}</h2>
        <p class="carousel-description">${movie.overview}</p>
        <div class="carousel-actions">
            <button class="play-btn" onclick="location.href='movie.html?id=${movie.id}&type=${movie.media_type}'">
                <i class="fas fa-play"></i> Watch Now
            </button>
            <button class="more-info-btn" onclick="showMovieDetails(${JSON.stringify(movie)})">
                <i class="fas fa-info-circle"></i> More Info
            </button>
        </div>
    `;
};

// Add carousel control functions
let currentSlide = 0;
let autoScrollInterval;

const setupCarouselControls = (trending) => {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            navigateCarousel('prev', trending);
            resetAutoScroll(trending);
        });

        nextBtn.addEventListener('click', () => {
            navigateCarousel('next', trending);
            resetAutoScroll(trending);
        });
    }
};

const navigateCarousel = (direction, trending) => {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;

    slides[currentSlide].classList.remove('active');
    
    if (direction === 'next') {
        currentSlide = (currentSlide + 1) % slides.length;
    } else {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    }
    
    slides[currentSlide].classList.add('active');
    
    // Update carousel info with current slide's data
    const movieData = trending[currentSlide];
    updateCarouselInfo(movieData);
};

const startAutoScroll = (trending) => {
    // Clear any existing interval first
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
    }
    
    autoScrollInterval = setInterval(() => {
        navigateCarousel('next', trending);
    }, 5000); // Change slide every 5 seconds
};

const resetAutoScroll = (trending) => {
    clearInterval(autoScrollInterval);
    startAutoScroll(trending);
};

// Event Listeners
closeModal.addEventListener('click', () => {
    movieModal.style.display = 'none';
});

// Initialize Content
document.addEventListener('DOMContentLoaded', () => {
    initHeroCarousel();
    initializeContentSection('/movie/popular', popularMovies);
    initializeContentSection('/trending/movie/week', trendingMovies);
    initializeContentSection('/tv/popular', topTVShows);
    initializeContentSection('/movie/now_playing', newReleases);
});

// Add to your main JavaScript file
document.querySelectorAll('.floating-icon').forEach(icon => {
    const randomX = (Math.random() * 200 - 100) + 'px'; // Random value between -100px and 100px
    icon.style.setProperty('--random-x', randomX);
});