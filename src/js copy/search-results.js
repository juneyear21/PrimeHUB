const TMDB_API_KEY = '557c35bbbe97da53f3bdfa06f11ff7de';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('query');
const page = parseInt(urlParams.get('page')) || 1;

async function loadSearchResults() {
    try {
        // Update search query in title
        document.getElementById('searchQuery').textContent = query;
        document.title = `Search: ${query} - PrimeHUB`;

        // Fetch search results
        const response = await fetch(
            `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${query}&page=${page}`
        );
        const data = await response.json();

        // Filter and display results
        const validResults = data.results.filter(
            item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
        );

        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = validResults.map(item => `
            <div class="movie-card" onclick="location.href='movie.html?id=${item.id}&type=${item.media_type}'">
                <img src="${TMDB_IMAGE_BASE_URL}/w342${item.poster_path}" alt="${item.title || item.name}">
                <div class="movie-info">
                    <h3>${item.title || item.name}</h3>
                    <div class="movie-meta">
                        <span class="rating">★ ${item.vote_average.toFixed(1)}</span>
                        <span class="year">${(item.release_date || item.first_air_date || '').split('-')[0]}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Create pagination
        const totalPages = Math.min(data.total_pages, 500);
        createPagination(page, totalPages);

    } catch (error) {
        console.error('Error loading search results:', error);
    }
}

function createPagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    let paginationHtml = '<div class="wp-pagenavi">';

    // Previous page
    if (currentPage > 1) {
        paginationHtml += `<a class="previouspostslink" rel="prev" href="?query=${query}&page=${currentPage - 1}">&lt; Previous</a>`;
    }

    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        if (i === currentPage) {
            paginationHtml += `<span class="current">${i}</span>`;
        } else {
            paginationHtml += `<a class="page larger" href="?query=${query}&page=${i}">${i}</a>`;
        }
    }

    // Next page
    if (currentPage < totalPages) {
        paginationHtml += `<a class="nextpostslink" rel="next" href="?query=${query}&page=${currentPage + 1}">Next &gt;</a>`;
    }

    paginationHtml += '</div>';
    pagination.innerHTML = paginationHtml;
}

// Initialize page
document.addEventListener('DOMContentLoaded', loadSearchResults);