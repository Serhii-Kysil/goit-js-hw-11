import { searchImages } from './API';
import { showEndMessage, handleSearchResults } from './Gallery';
import Notiflix from 'notiflix';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const obsTarget = document.querySelector('.js-obs');

export let currentPage = 1;

let observer;
let loading = false;
let currentSearchQuery = '';
let canLoadMore = true;

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value;

  if (searchQuery.trim() !== '') {
    currentPage = 1;

    try {
      const data = await searchImages(searchQuery, currentPage);
      handleSearchResults(form, currentSearchQuery, gallery, data, createCard);
      showEndMessage(data.totalHits);
      showTotalResults(data.totalHits);

      if (data.totalHits > 40) {
        setupIntersectionObserver();
      }
    } catch (error) {
      console.error(error);
    }

    currentSearchQuery = searchQuery;
  } else {
    Notiflix.Notify.failure('Please enter a non-empty search query.');
  }
});

function setupIntersectionObserver() {
  observer = new IntersectionObserver(
    async entries => {
      const entry = entries[0];

      if (entry.isIntersecting && !loading && canLoadMore) {
        loading = true;

        await loadMore();

        loading = false;

        const totalPages = Math.ceil(entry.target.totalHits / 40);
        if (currentPage === totalPages) {
          observer.unobserve(obsTarget);
        }
      }
    },
    {
      root: null,
      rootMargin: '300px',
      threshold: 0.99,
    }
  );

  observer.observe(obsTarget);
}

async function loadMore() {
  if (form.elements.searchQuery.value.trim() === '') {
    return;
  }

  currentPage++;

  try {
    const data = await searchImages(
      form.elements.searchQuery.value.trim(),
      currentPage
    );

    //  await new Promise(resolve => setTimeout(resolve, 500));

    handleSearchResults(form, currentSearchQuery, gallery, data, createCard);
    showEndMessage(data.totalHits);

    smoothScrollToNextGroup();
    const totalPages = Math.ceil(data.totalHits / 40);
    console.log(totalPages);

    if (data.hits.length < 40) {
      canLoadMore = false;
    }
  } catch (error) {
    console.error('Error fetching more data:', error);
  }
}

function showTotalResults(totalHits) {
  Notiflix.Notify.info(`Total results found: ${totalHits}`);
}

function smoothScrollToNextGroup() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
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
