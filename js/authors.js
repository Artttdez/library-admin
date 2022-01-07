function renderAuthors(authorsRequest){
  const authors = document.getElementById('authors');
  authors.innerHTML = `<div class="showcase__item showcase__item_action" onclick="togglePopupAuthor(-1)">
          <div style="height: 23px"></div>
          <i class="ri-add-line showcase__item-icon"></i>
          <div class="showcase__item-title">
            Add new author
          </div>
        </div>`;
  for (let item of JSON.parse(authorsRequest.response)) {
    authors.innerHTML += `<div class="showcase__item" id="${item.id}" onclick="togglePopupAuthor(${item.id})">
            <div class="showcase__item-type">
                Books: ${item.books_count}
            </div>
            <i class="ri-quill-pen-line showcase__item-icon"></i>
            <div class="showcase__item-title">
                ${item.first_name} ${item.last_name}
            </div>
        </div>`;
  }
}

function updateAuthors(){
  const authorsRequest = new XMLHttpRequest();
  authorsRequest.open('GET', 'http://127.0.0.1:8000/api/authors/', false);
  authorsRequest.send();
  renderAuthors(authorsRequest);
}

function searchAuthors(filters){
  const params = new URLSearchParams(filters);
  const authorsRequest = new XMLHttpRequest();
  authorsRequest.open('GET', `http://127.0.0.1:8000/api/authors/?${params.toString()}`, false);
  authorsRequest.send();
  renderAuthors(authorsRequest);
}

updateAuthors();

const popup = document.getElementById('popup');
const formAuthor = document.getElementById('formAuthor');
let authorId = -1;

function togglePopupAuthor(id){
  authorId = id;
  if (id === -1) {
    popup.classList.toggle('popup_open');
    formAuthor.querySelector(".block__submit").value = 'Add';
    formAuthor.querySelector(".block__title").innerText = 'Add new author';
    formAuthor.querySelector(".block__submit_white").style.display = 'none';
    formAuthor.reset();
  }
  else {
    const authorRequest = new XMLHttpRequest();
    authorRequest.open('GET', `http://127.0.0.1:8000/api/authors/${id}/`, false);
    authorRequest.send();
    const response = JSON.parse(authorRequest.response);
    formAuthor.querySelector("[name='first_name']").value = response.first_name;
    formAuthor.querySelector("[name='last_name']").value = response.last_name;
    popup.classList.toggle('popup_open');
    formAuthor.querySelector(".block__submit").value = 'Save';
    formAuthor.querySelector(".block__title").innerText = 'Edit author';
    formAuthor.querySelector(".block__submit_white").style.display = 'inline-block';
    formAuthor.querySelector(".block__submit_white").addEventListener('click', () => {
      popup.classList.remove('popup_open');
      const formAuthorRequest = new XMLHttpRequest();
      formAuthorRequest.open('DELETE', `http://127.0.0.1:8000/api/authors/${authorId}/`, false);
      formAuthorRequest.send();
      updateAuthors();
    });
  }
}

formAuthor.addEventListener('submit', (event)  => {
  event.preventDefault();
  if (authorId === -1){
    const formAuthorRequest = new XMLHttpRequest();
    formAuthorRequest.open('POST', 'http://127.0.0.1:8000/api/authors/', false);
    formAuthorRequest.send(new FormData(event.target));
  }
  else {
    const formAuthorRequest = new XMLHttpRequest();
    formAuthorRequest.open('PATCH', `http://127.0.0.1:8000/api/authors/${authorId}/`, false);
    formAuthorRequest.send(new FormData(event.target));
  }
  formAuthorFilter.reset();
  togglePopupAuthor(-1);
  updateAuthors();
})

const formAuthorFilter = document.getElementById('formAuthorFilter')
formAuthorFilter.addEventListener('submit', (event)  => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData.entries());
  if (filters.search === ''){
    delete filters.search;
  }
  searchAuthors(filters);
})
