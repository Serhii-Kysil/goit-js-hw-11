import axios from 'axios';

export async function searchImages(searchQuery, currentPage) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=41063294-22703a347494c512539cceaf8&q=${searchQuery.trim()}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`
    );
    return response.data;
  } catch (error) {
    throw new Error('Error fetching data:', error);
  }
}
