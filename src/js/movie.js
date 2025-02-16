const TMDB_API_KEY = '557c35bbbe97da53f3bdfa06f11ff7de';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Get movie ID and type from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');
const mediaType = urlParams.get('type');

async function loadMovieDetails() {
    try {
        // Fetch movie details
        const response = await fetch(
            `${TMDB_BASE_URL}/${mediaType}/${movieId}?api_key=${TMDB_API_KEY}`
        );
        const movie = await response.json();

        // Load player
        const playerContainer = document.getElementById('playerContainer');
        playerContainer.innerHTML = `
            <iframe
                src="https://vidsrc.to/embed/${mediaType}/${movieId}"
                allowfullscreen
            ></iframe>
        `;

        // Load movie info
        const movieInfo = document.getElementById('movieInfo');
        movieInfo.innerHTML = `
            <h1>${movie.title || movie.name}</h1>
            <div class="meta-info">
                <span>Rating: ★ ${movie.vote_average.toFixed(1)}</span>
                <span>Release: ${movie.release_date || movie.first_air_date}</span>
                <span>Runtime: ${movie.runtime || movie.episode_run_time?.[0] || 'N/A'} min</span>
            </div>
            <p class="overview">${movie.overview}</p>
        `;

        // Load related content
        loadRelatedContent(movieId, mediaType);
        
        // Update page title
        document.title = `${movie.title || movie.name} - PrimeHUB`;

    } catch (error) {
        console.error('Error loading movie details:', error);
    }
}

async function loadRelatedContent(movieId, mediaType) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/${mediaType}/${movieId}/similar?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();
        
        const relatedContent = document.getElementById('relatedContent');
        relatedContent.innerHTML = `
            <h2>Similar Content</h2>
            <div class="movie-carousel">
                ${data.results.slice(0, 10).map(movie => `
                    <div class="movie-card" onclick="location.href='movie.html?id=${movie.id}&type=${mediaType}'">
                        <img src="${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}" alt="${movie.title || movie.name}">
                        <div class="movie-info">
                            <h3>${movie.title || movie.name}</h3>
                            <div class="movie-meta">
                                <span class="rating">★ ${movie.vote_average.toFixed(1)}</span>
                                <span class="year">${(movie.release_date || movie.first_air_date || '').split('-')[0]}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading related content:', error);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', loadMovieDetails);