const TMDB_API_KEY = '557c35bbbe97da53f3bdfa06f11ff7de';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');
const page = parseInt(urlParams.get('page')) || 1;

const endpoints = {
    trending: '/trending/movie/week',
    popular: '/movie/popular',
    topTv: '/tv/popular',
    newReleases: '/movie/now_playing'
};

const titles = {
    trending: 'Trending Now',
    popular: 'Popular Movies',
    topTv: 'Top TV Shows',
    newReleases: 'New Releases'
};

async function loadAllMovies() {
    try {
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        pageTitle.textContent = titles[type] || 'All Movies';

        // Fetch movies
        const response = await fetch(
            `${TMDB_BASE_URL}${endpoints[type]}?api_key=${TMDB_API_KEY}&page=${page}`
        );
        const data = await response.json();

        // Display movies
        const moviesGrid = document.getElementById('moviesGrid');
        moviesGrid.innerHTML = data.results.map(movie => `
            <div class="movie-card" onclick="location.href='movie.html?id=${movie.id}&type=${type === 'topTv' ? 'tv' : 'movie'}'">
                <img src="${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}" alt="${movie.title || movie.name}">
                <div class="movie-info">
                    <h3>${movie.title || movie.name}</h3>
                    <div class="movie-meta">
                        <span class="rating">★ ${movie.vote_average.toFixed(1)}</span>
                        <span class="year">${(movie.release_date || movie.first_air_date || '').split('-')[0]}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Create pagination
        const totalPages = Math.min(data.total_pages, 500); // TMDB limits to 500 pages
        createPagination(page, totalPages);

    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

function createPagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    let paginationHtml = '<div class="wp-pagenavi">';

    // Previous page
    if (currentPage > 1) {
        paginationHtml += `<a class="previouspostslink" rel="prev" href="?type=${type}&page=${currentPage - 1}">&lt; Previous</a>`;
    }

    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        if (i === currentPage) {
            paginationHtml += `<span class="current">${i}</span>`;
        } else {
            paginationHtml += `<a class="page larger" href="?type=${type}&page=${i}">${i}</a>`;
        }
    }

    // Next page
    if (currentPage < totalPages) {
        paginationHtml += `<a class="nextpostslink" rel="next" href="?type=${type}&page=${currentPage + 1}">Next &gt;</a>`;
    }

    paginationHtml += '</div>';
    pagination.innerHTML = paginationHtml;
}

// Initialize page
document.addEventListener('DOMContentLoaded', loadAllMovies);