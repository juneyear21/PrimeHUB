const TMDB_API_KEY = '557c35bbbe97da53f3bdfa06f11ff7de';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Get movie ID and type from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');
const mediaType = urlParams.get('type');

// Update the loadMovieDetails function
async function loadMovieDetails() {
    try {
        // Fetch movie/show details
        const response = await fetch(
            `${TMDB_BASE_URL}/${mediaType}/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
        );
        const movie = await response.json();

        // Add season/episode controls for TV shows
        const seasonEpisodeControls = mediaType === 'tv' ? `
            <div class="episode-controls">
                <div class="control-group">
                    <label>Season:</label>
                    <select id="seasonSelect">
                        ${Array.from({length: movie.number_of_seasons}, (_, i) => i + 1)
                            .map(num => `<option value="${num}">Season ${num}</option>`).join('')}
                    </select>
                </div>
                <div class="control-group">
                    <label>Episode:</label>
                    <select id="episodeSelect">
                        <option value="1">Episode 1</option>
                    </select>
                </div>
            </div>
        ` : '';

        // Create player container
        const playerContainer = document.getElementById('playerContainer');
        playerContainer.innerHTML = `
            <div class="player-wrapper">
                ${seasonEpisodeControls}
                <div class="player-overlay" id="playerOverlay">
                    <div class="player-message">
                        <i class="fas fa-shield-alt"></i>
                        <span>Click here to load the player</span>
                        <small>We block ads and popups for better experience</small>
                    </div>
                </div>
                <div class="player-frame" id="playerFrame" style="display: none;">
                    <iframe
                        src="about:blank"
                        data-src="https://player.videasy.net/${mediaType}/${movieId}${mediaType === 'tv' ? '/1/1' : ''}"
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                        frameborder="0"
                        allowfullscreen
                        sandbox="allow-same-origin allow-scripts allow-forms"
                        allow="encrypted-media"
                    ></iframe>
                </div>
            </div>
            <div class="language-instruction">
                <div class="instruction-box">
                    <img src="https://flagsapi.com/IN/flat/24.png" alt="Indian Flag" class="flag-icon">
                    <p>For Hindi audio: Select cloud/server option within the player and choose "Fade Hindi" if available.</p>
                </div>
            </div>
        `;

        // Add download options after the player
        const downloadSection = document.createElement('div');
        downloadSection.className = 'download-section';
        downloadSection.innerHTML = `
            <div class="download-options">
                <h3>Download Options</h3>
                <div class="download-buttons">
                    <button id="downloadVideo" class="download-btn primary">
                        <i class="fas fa-download"></i> Download as Video
                    </button>
                    <button id="copyHLS" class="download-btn secondary">
                        <i class="fas fa-copy"></i> Copy Stream URL
                    </button>
                </div>
                <p class="download-note">Note: Download quality depends on the selected server. Use a video player that supports HLS streams.</p>
            </div>
        `;

        // Insert after player container
        document.querySelector('.player-wrapper').after(downloadSection);

        // Add click handlers for download buttons
        document.getElementById('downloadVideo').addEventListener('click', async () => {
            const streamUrl = await getStreamUrl();
            if (streamUrl) {
                const downloadUrl = `https://hlsdownload.example.com/?url=${encodeURIComponent(streamUrl)}`;
                window.open(downloadUrl, '_blank');
            }
        });

        document.getElementById('copyHLS').addEventListener('click', async () => {
            const streamUrl = await getStreamUrl();
            if (streamUrl) {
                await navigator.clipboard.writeText(streamUrl);
                showNotification('Stream URL copied to clipboard!');
            }
        });

        // Add event listeners for TV show controls
        if (mediaType === 'tv') {
            const seasonSelect = document.getElementById('seasonSelect');
            const episodeSelect = document.getElementById('episodeSelect');
            const playerFrame = document.getElementById('playerFrame');

            // Fetch episodes for first season
            await updateEpisodeOptions(1);

            // Handle season change
            seasonSelect.addEventListener('change', async function() {
                await updateEpisodeOptions(this.value);
                updatePlayerSource();
            });

            // Handle episode change
            episodeSelect.addEventListener('change', function() {
                updatePlayerSource();
            });

            // Function to update episode options
            async function updateEpisodeOptions(seasonNum) {
                const response = await fetch(
                    `${TMDB_BASE_URL}/tv/${movieId}/season/${seasonNum}?api_key=${TMDB_API_KEY}`
                );
                const seasonData = await response.json();
                
                episodeSelect.innerHTML = seasonData.episodes
                    .map(ep => `<option value="${ep.episode_number}">Episode ${ep.episode_number}</option>`)
                    .join('');
            }

            // Function to update player source
            function updatePlayerSource() {
                const season = seasonSelect.value;
                const episode = episodeSelect.value;
                const iframe = playerFrame.querySelector('iframe');
                iframe.src = `https://player.videasy.net/tv/${movieId}/${season}/${episode}`;
            }
        }

        // Add click handler for the overlay
        const overlay = document.getElementById('playerOverlay');
        const playerFrame = document.getElementById('playerFrame');
        
        overlay.addEventListener('click', () => {
            const iframe = playerFrame.querySelector('iframe');
            iframe.src = iframe.dataset.src;
            overlay.style.display = 'none';
            playerFrame.style.display = 'block';
        });

        // Load movie info
        const movieInfo = document.getElementById('movieInfo');
        movieInfo.innerHTML = `
            <h1>${movie.title || movie.name}</h1>
            
            <div class="movie-meta-info">
                <div class="meta-item rating-badge">
                    <i class="fas fa-star"></i>
                    <span class="rating-value">${movie.vote_average.toFixed(1)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${movie.runtime || movie.episode_run_time?.[0] || 'N/A'} min</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${(movie.release_date || movie.first_air_date || '').split('-')[0]}</span>
                </div>
            </div>

            <div class="genre-tags">
                ${movie.genres.map(genre => `
                    <span class="genre-tag">${genre.name}</span>
                `).join('')}
            </div>

            <p class="overview">${movie.overview}</p>

            <div class="movie-details">
                <div class="detail-item">
                    <span class="detail-label">Director</span>
                    <span class="detail-value">${
                        movie.credits?.crew?.find(person => person.job === 'Director')?.name || 'N/A'
                    }</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Writers</span>
                    <span class="detail-value">${
                        movie.credits?.crew
                            ?.filter(person => person.department === 'Writing')
                            ?.slice(0, 2)
                            ?.map(writer => writer.name)
                            ?.join(', ') || 'N/A'
                    }</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Stars</span>
                    <span class="detail-value">${
                        movie.credits?.cast
                            ?.slice(0, 3)
                            ?.map(actor => actor.name)
                            ?.join(', ') || 'N/A'
                    }</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Language</span>
                    <span class="detail-value">${movie.original_language?.toUpperCase() || 'N/A'}</span>
                </div>
            </div>
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

// Add function to extract stream URL
async function extractStreamUrl() {
    try {
        const iframe = document.querySelector('.player-frame iframe');
        if (!iframe) return null;

        // You'll need to implement the actual stream URL extraction logic here
        // This is just a placeholder example
        const streamUrl = iframe.src;
        return streamUrl;
    } catch (error) {
        console.error('Error extracting stream URL:', error);
        return null;
    }
}

// Add toast notification function
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Add these helper functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

async function getStreamUrl() {
    // This function should extract the actual stream URL
    // You'll need to implement the actual extraction logic
    const iframe = document.querySelector('.player-frame iframe');
    return iframe?.src || null;
}

// Add to both app.js and movie.js
document.getElementById('hamburgerMenu').addEventListener('click', () => {
    const navMiddle = document.querySelector('.nav-middle');
    navMiddle.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-middle') && !e.target.closest('.hamburger-menu')) {
        document.querySelector('.nav-middle').classList.remove('active');
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', loadMovieDetails);

// Add this to both app.js and movie.js
// Search Functionality
let searchTimeout;

function initializeSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchForm || !searchInput || !searchResults) return;

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

    // Add click outside listener to close search results
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-middle')) {
            searchResults.style.display = 'none';
        }
    });
}

// Update handleSearch function
async function handleSearch(query) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${query}`
        );
        const data = await response.json();

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
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
    // ... existing initialization code ...
});