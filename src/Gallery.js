import Notiflix from 'notiflix';
import { currentPage } from './index';

export function showEndMessage(totalHits) {
  const visibleImages = currentPage * 40;

  if (totalHits > 0 && visibleImages >= totalHits) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

export function handleSearchResults(
  form,
  currentSearchQuery,
  gallery,
  data,
  createCard
) {
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
