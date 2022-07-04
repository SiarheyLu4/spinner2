import './sass/main.scss';
// import './js/preloader';
import { Spinner } from 'spin.js';
import opts from './js/spinner';
import axios from "axios";
import { Notify } from 'notiflix';

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');

searchForm.addEventListener('submit', onSearchForm);
btnLoadMore.addEventListener('click', onBtnLoadMore);

let query ='';
let page = 1;

const KEY = '28282273-de260e28427aa1fd2a8294f86';

async function fetchImages(query, page) {
    const response = await axios.get(
    `https://pixabay.com/api/?key=${KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`);
    console.log(response);
    var target = document.getElementById('gallery');
    var spinner = new Spinner(opts).spin(target);
    return response;
};

function onSearchForm(e) {
    e.preventDefault();
    page = 1;
    query = e.currentTarget.searchQuery.value.trim();
    gallery.innerHTML = '';
    
    if (query === '') {
        btnLoadMore.classList.add('is-hidden');
        Notify.failure('The search string cannot be empty. Please specify your search query.');
    return;
    }

    fetchImages(query, page)
    .then(({ data }) => {
    if (data.totalHits === 0) {
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    } else {
        renderGallery(data.hits);
        Notify.success(`Hooray! We found ${data.totalHits} images.`);

        if (data.totalHits > 40) {
        btnLoadMore.classList.remove('is-hidden');
        }
    }})
    .catch(error => console.log(error))
    .finally(() => {
        searchForm.reset();
        spinner.stop();
    });
};

function renderGallery(images) {
    const markup = images
    .map(image => {
        const { id, largeImageURL, webformatURL, tags, likes, views, comments, downloads } = image;
        return `
            <div class="photo-card">
                <img src="${webformatURL}" alt="${tags}" width="200" loading="lazy" />
                <div class="info">
                    <p class="info-item"><b>Likes: </b>${likes}</p>
                    <p class="info-item"><b>Views: </b>${views}</p>
                    <p class="info-item"><b>Comments: </b>${comments}</p>
                    <p class="info-item"><b>Downloads: </b>${downloads}</p>
                </div>
            </div>
            `;
    })
    .join('');
    gallery.insertAdjacentHTML('beforeend', markup);
}

function onBtnLoadMore() {
    page += 1;

    fetchImages(query, page)
        .then(({ data }) => {
        renderGallery(data.hits);

        const totalPages = Math.ceil(data.totalHits / 40);
        if (page > totalPages) {
            btnLoadMore.classList.add('is-hidden');
            Notify.failure("We're sorry, but you've reached the end of search results.");
        }
    })
        .catch(error => console.log(error));
};

