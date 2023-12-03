import axios from 'axios';
import Notiflix from 'notiflix';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
let currentPage = 1;
let loading = false;
let currentSearchQuery = '';

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value;

  if (searchQuery) {
    try {
      const response = await axios.get(
        `https://pixabay.com/api/?key=41042806-40fd19d59ddc4212409431af3&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`
      );

      const data = response.data;
      handleSearchResults(data);
      showEndMessage(data.totalHits);
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    return (currentSearchQuery = searchQuery);
  }
});

// Визначення нескінченного завантаження під час прокручування
window.addEventListener('scroll', async function () {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100 && !loading) {
    await loadMore();
  }
});

async function loadMore() {
  if (form.elements.searchQuery.value.trim() === '') {
    return;
  }

  loading = true;
  currentPage++;

  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=41042806-40fd19d59ddc4212409431af3&q=${form.elements.searchQuery.value.trim()}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`
    );

    const data = response.data;
    handleSearchResults(data);
    showEndMessage(data.totalHits);
  } catch (error) {
    console.error('Error fetching more data:', error);
  } finally {
    loading = false;
  }
}

function showEndMessage(totalHits) {
  const visibleImages = currentPage * 40;

  if (totalHits > 0 && visibleImages >= totalHits) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function handleSearchResults(data) {
  // Очищення галереї, лише якщо введений запит змінився
  if (form.elements.searchQuery.value.trim() !== currentSearchQuery) {
    gallery.innerHTML = '';
  }

  if (data.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    const html = data.hits.map(createCard).join('');
    gallery.innerHTML += html;
  }
}

function createCard(image) {
  return `
    <div class="photo-card">
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </div>
  `;
}
