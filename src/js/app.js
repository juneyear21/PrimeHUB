// API Configuration
const TMDB_API_KEY = '557c35bbbe97da53f3bdfa06f11ff7de';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// DOM Elements
const trendingMovies = document.getElementById('trendingMovies');
const popularMovies = document.getElementById('popularMovies');
const topTVShows = document.getElementById('topTVShows');
const newReleases = document.getElementById('newReleases');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
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
        <div class="movie-info">
            <h3>${movie.title || movie.name}</h3>
            <div class="movie-meta">
                <span class="rating">★ ${movie.vote_average.toFixed(1)}</span>
                <span class="year">${(movie.release_date || movie.first_air_date || '').split('-')[0]}</span>
            </div>
        </div>
    `;
    
    // Update click handler to navigate to movie.html
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
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 3) {
        searchResults.style.display = 'none';
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        const data = await fetchFromTMDB('/search/multi', { query });
        if (!data?.results) return;
        
        searchResults.innerHTML = '';
        searchResults.style.display = 'block';
        
        data.results.slice(0, 5).forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <img src="${item.poster_path ? `${TMDB_IMAGE_BASE_URL}/w92${item.poster_path}` : 'assets/images/placeholder.jpg'}">
                <div>
                    <h4>${item.title || item.name}</h4>
                    <p>${item.media_type} • ${(item.release_date || item.first_air_date || '').split('-')[0]}</p>
                </div>
            `;
            resultItem.addEventListener('click', () => showMovieDetails(item));
            searchResults.appendChild(resultItem);
        });
    }, 500);
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

// Feature: Hero Carousel
const initHeroCarousel = async () => {
    const data = await fetchFromTMDB('/trending/all/day');
    if (!data?.results) return;

    const trending = data.results.slice(0, 5);
    const heroCarousel = document.getElementById('heroCarousel');
    
    // Clear existing content
    heroCarousel.innerHTML = '';
    
    trending.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        
        const backdropUrl = `${TMDB_IMAGE_BASE_URL}/original${item.backdrop_path}`;
        slide.style.backgroundImage = `url(${backdropUrl})`;
        
        // Store movie data in the slide element
        slide.dataset.movieData = JSON.stringify(item);
        
        heroCarousel.appendChild(slide);
    });

    // Update initial carousel info
    updateCarouselInfo(trending[0]);

    // Setup controls and start auto-scroll
    setupCarouselControls();
    startAutoScroll();
};

// Add new function to update carousel information
const updateCarouselInfo = (movie) => {
    const carouselTitle = document.getElementById('carousel-title');
    if (!carouselTitle) return;

    // Get the title based on media type
    const title = movie.title || movie.name;
    
    // Get the overview and truncate it if too long
    let overview = movie.overview;
    if (overview.length > 200) {
        overview = overview.substring(0, 200) + '...';
    }

    carouselTitle.innerHTML = `
        <h3>${title}</h3>
        <p>${overview}</p>
    `;
};

// Add carousel control functions
let currentSlide = 0;
let autoScrollInterval;

const setupCarouselControls = () => {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            navigateCarousel('prev');
            resetAutoScroll();
        });

        nextBtn.addEventListener('click', () => {
            navigateCarousel('next');
            resetAutoScroll();
        });
    }
};

const navigateCarousel = (direction) => {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;

    slides[currentSlide].classList.remove('active');
    
    if (direction === 'next') {
        currentSlide = (currentSlide + 1) % slides.length;
    } else {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    }
    
    slides[currentSlide].classList.add('active');
    
    // Get all trending movies data
    const trendingData = slides[currentSlide].dataset.movieData;
    if (trendingData) {
        const movieData = JSON.parse(trendingData);
        updateCarouselInfo(movieData);
    }
};

const startAutoScroll = () => {
    // Clear any existing interval first
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
    }
    
    autoScrollInterval = setInterval(() => {
        navigateCarousel('next');
    }, 5000); // Change slide every 5 seconds
};

const resetAutoScroll = () => {
    clearInterval(autoScrollInterval);
    startAutoScroll();
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