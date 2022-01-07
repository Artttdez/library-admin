function renderCatalogs(catalogsRequest){
  const catalogs = document.getElementById('catalogs');
  catalogs.innerHTML = `<div class="showcase__item showcase__item_action" onclick="togglePopupCatalog(-1)">
          <div style="height: 23px"></div>
          <i class="ri-add-line showcase__item-icon"></i>
          <div class="showcase__item-title">
            Add new catalog
          </div>
        </div>`;
  for (let item of JSON.parse(catalogsRequest.response)) {
    catalogs.innerHTML += `<div class="showcase__item" id="${item.id}" onclick="togglePopupCatalog(${item.id})">
            <div class="showcase__item-type">
                Books: ${item.books_count}
            </div>
            <i class="ri-folder-open-line showcase__item-icon"></i>
            <div class="showcase__item-title">
                ${item.title}
            </div>
        </div>`;
  }
}

function updateCatalogs(){
  const catalogsRequest = new XMLHttpRequest();
  catalogsRequest.open('GET', 'http://127.0.0.1:8000/api/catalogs/', false);
  catalogsRequest.send();
  renderCatalogs(catalogsRequest);
}

updateCatalogs();

function searchCatalogs(filters){
  const params = new URLSearchParams(filters);
  const catalogsRequest = new XMLHttpRequest();
  catalogsRequest.open('GET', `http://127.0.0.1:8000/api/catalogs/?${params.toString()}`, false);
  catalogsRequest.send();
  renderCatalogs(catalogsRequest);
}

const formCatalogFilter = document.getElementById('formCatalogFilter')
formCatalogFilter.addEventListener('submit', (event)  => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData.entries());
  if (filters.search === ''){
    delete filters.search;
  }
  searchCatalogs(filters);
})

const popup = document.getElementById('popup');
const formCatalog = document.getElementById('formCatalog');
let catalogId = -1;


function togglePopupCatalog(id){
  catalogId = id;
  booksInCatalog.innerHTML = ``;
  setBooksInCatalog.clear();
  if (id === -1) {
    popup.classList.toggle('popup_open');
    formCatalog.querySelector(".block__submit").value = 'Add';
    formCatalog.querySelector(".block__title").innerText = 'Add new catalog';
    formCatalog.querySelector(".block__submit_white").style.display = 'none';
    formCatalog.reset();
  }
  else {
    const catalogRequest = new XMLHttpRequest();
    catalogRequest.open('GET', `http://127.0.0.1:8000/api/catalogs/${id}/`, false);
    catalogRequest.send();
    const response = JSON.parse(catalogRequest.response);
    formCatalog.querySelector("[name='title']").value = response.title;
    for(let book of response.books){
      renderBookInCatalog(book);
    }
    popup.classList.toggle('popup_open');
    formCatalog.querySelectorAll(".block__submit")[1].value = 'Save';
    formCatalog.querySelector(".block__title").innerText = 'Edit catalog';
    formCatalog.querySelector(".block__submit_white").style.display = 'inline-block';
    formCatalog.querySelector(".block__submit_white").addEventListener('click', () => {
      popup.classList.remove('popup_open');
      const formCatalogRequest = new XMLHttpRequest();
      formCatalogRequest.open('DELETE', `http://127.0.0.1:8000/api/catalogs/${catalogId}/`, false);
      formCatalogRequest.send();
      updateCatalogs();
    });
  }
}

const booksRequest = new XMLHttpRequest();

booksRequest.open('GET', 'http://127.0.0.1:8000/api/books/', false);
booksRequest.send();

for (let book of JSON.parse(booksRequest.response)){
  document.getElementById('popupBooks').innerHTML +=
    `<option value="${book.id}">
          ${book.title}
       </option>`
}

const buttonAddBook = document.getElementById('buttonAddBook');
const booksInCatalog = document.getElementById('popupBooksInCatalog');
const popupBooks = document.getElementById('popupBooks');
let setBooksInCatalog = new Set();

function renderBookInCatalog(book){
  if (!setBooksInCatalog.has(book.id)) {
    setBooksInCatalog.add(book.id);
    booksInCatalog.innerHTML += `<div class="book" id="bookInCatalog${book.id}">
    <div class="book__title">
      ${book.title}
    </div>
    <i class="ri-delete-bin-6-line book__delete" onclick="deleteBook(${book.id})"></i>
    </div>`
  }
}

buttonAddBook.addEventListener('click', () => {
  const id = popupBooks.options.selectedIndex;
  const value = popupBooks.value;
  if (!setBooksInCatalog.has(Number(value))) {
    setBooksInCatalog.add(Number(value));
    booksInCatalog.innerHTML += `<div class="book" id="bookInCatalog${value}">
    <div class="book__title">
      ${popupBooks.options[id].label}
    </div>
    <i class="ri-delete-bin-6-line book__delete" onclick="deleteBook(${value})"></i>
    </div>`
  }
})

function deleteBook(value){
  setBooksInCatalog.delete(value);
  document.getElementById(`bookInCatalog${value}`).remove();
}

formCatalog.addEventListener('submit', (event)  => {
  event.preventDefault();
  if (catalogId === -1){
    const formCatalogRequest = new XMLHttpRequest();
    formCatalogRequest.open('POST', 'http://127.0.0.1:8000/api/catalogs/', false);
    formCatalogRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    const formData = new FormData(event.target);
    let body = {};
    formData.forEach((value, key) => body[key] = value);
    body.books = [...setBooksInCatalog];
    formCatalogRequest.send(JSON.stringify(body));
  }
  else {
    const formCatalogRequest = new XMLHttpRequest();
    formCatalogRequest.open('PATCH', `http://127.0.0.1:8000/api/catalogs/${catalogId}/`, false);
    formCatalogRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    const formData = new FormData(event.target);
    let body = {};
    formData.forEach((value, key) => body[key] = value);
    body.books = [...setBooksInCatalog];
    formCatalogRequest.send(JSON.stringify(body));
  }
  formCatalogFilter.reset();
  togglePopupCatalog(-1);
  updateCatalogs();
})



