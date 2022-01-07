function renderBooks(booksRequest){
  const books = document.getElementById('books');
  books.innerHTML = `<div class="showcase__item showcase__item_action" onclick="togglePopupBook(-1)">
          <div style="height: 23px"></div>
          <i class="ri-add-line showcase__item-icon"></i>
          <div class="showcase__item-title">
            Add new book
          </div>
        </div>`;
  for (let item of JSON.parse(booksRequest.response)) {
    books.innerHTML += `<div class="showcase__item" id="${item.id}" onclick="togglePopupBook(${item.id})">
          <div class="showcase__item-type">
            ${item.genre}
          </div>
          <i class="ri-book-2-line showcase__item-icon"></i>
          <div class="showcase__item-title">
            ${item.title}
          </div>
          <div class="showcase__item-subtitle">
            ${item.author ? item.author.full_name : '-'}
          </div>
        </div>`;
  }
}

function updateBooks(){
  const booksRequest = new XMLHttpRequest();
  booksRequest.open('GET', 'http://127.0.0.1:8000/api/books/', false);
  booksRequest.send();
  renderBooks(booksRequest);
}

function searchBooks(filters){
  const params = new URLSearchParams(filters);
  const booksRequest = new XMLHttpRequest();
  booksRequest.open('GET', `http://127.0.0.1:8000/api/books/?${params.toString()}`, false);
  booksRequest.send();
  renderBooks(booksRequest);
}

updateBooks();

const popup = document.getElementById('popup');
const formBook = document.getElementById('formBook');
let bookId = -1;

function togglePopupBook(id){
  bookId = id;
  if (id === -1) {
    popup.classList.toggle('popup_open');
    formBook.querySelector(".block__submit").value = 'Add';
    formBook.querySelector(".block__title").innerText = 'Add new book';
    formBook.querySelector(".block__submit_white").style.display = 'none';
    formBook.reset();
  }
  else {
    const bookRequest = new XMLHttpRequest();
    bookRequest.open('GET', `http://127.0.0.1:8000/api/books/${id}/`, false);
    bookRequest.send();
    const response = JSON.parse(bookRequest.response);
    formBook.querySelector("[name='title']").value = response.title;
    formBook.querySelector("[name='description']").value = response.description;
    formBook.querySelector("[name='publication_year']").value = response.publication_year;
    formBook.querySelector("[name='genre']").value = Object.keys(genres).find(key => genres[key] === response.genre);
    formBook.querySelector("[name='author']").value = response.author? response.author.id : undefined;
    popup.classList.toggle('popup_open');
    formBook.querySelector(".block__submit").value = 'Save';
    formBook.querySelector(".block__title").innerText = 'Edit book';
    formBook.querySelector(".block__submit_white").style.display = 'inline-block';
    formBook.querySelector(".block__submit_white").addEventListener('click', () => {
      popup.classList.remove('popup_open');
      const formBookRequest = new XMLHttpRequest();
      formBookRequest.open('DELETE', `http://127.0.0.1:8000/api/books/${bookId}/`, false);
      formBookRequest.send();
      updateBooks();
    });
  }
}

const genresRequest = new XMLHttpRequest();

genresRequest.open('GET', 'http://127.0.0.1:8000/api/genres/', false);
genresRequest.send();

const genres = JSON.parse(genresRequest.response)

for (let id in genres){
  document.getElementById('popupGenre').innerHTML +=
    `<option value="${id}">
          ${genres[id]}
       </option>`
  document.getElementById('genre').innerHTML +=
    `<option value="${id}">
          ${genres[id]}
       </option>`
}

const authorsRequest = new XMLHttpRequest();

authorsRequest.open('GET', 'http://127.0.0.1:8000/api/authors/', false);
authorsRequest.send();

for (let author of JSON.parse(authorsRequest.response)){
  document.getElementById('popupAuthor').innerHTML +=
    `<option value="${author.id}">
          ${author.first_name} ${author.last_name}
       </option>`
  document.getElementById('author').innerHTML +=
    `<option value="${author.id}">
          ${author.first_name} ${author.last_name}
       </option>`
}

formBook.addEventListener('submit', (event)  => {
  event.preventDefault();
  if (bookId === -1){
    const formBookRequest = new XMLHttpRequest();
    formBookRequest.open('POST', 'http://127.0.0.1:8000/api/books/', false);
    formBookRequest.send(new FormData(event.target));
  }
  else {
    const formBookRequest = new XMLHttpRequest();
    formBookRequest.open('PATCH', `http://127.0.0.1:8000/api/books/${bookId}/`, false);
    formBookRequest.send(new FormData(event.target));
  }
  formBookFilter.reset();
  togglePopupBook(-1);
  updateBooks();
})

const formBookFilter = document.getElementById('formBookFilter')
formBookFilter.addEventListener('submit', (event)  => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData.entries());
  if (filters.search === ''){
    delete filters.search;
  }
  if (filters.genre === 'All'){
    delete filters.genre;
  }
  if (filters.author === 'All'){
    delete filters.author;
  }
  searchBooks(filters);
})
