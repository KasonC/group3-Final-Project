// Selectors for new category form
const newCategoryForm = document.querySelector('[data-new-category-form]');
const newCategoryInput = document.querySelector('[data-new-category-input]');

// Selector for categories container
const categoriesContainer = document.querySelector('[data-categories]');

// Selector for currently viewing
const currentlyViewing = document.querySelector('[data-currently-viewing]');

// Selector for new todo form
const newTodoForm = document.querySelector('[data-new-todo-form]');
const newTodoSelect = document.querySelector('[data-new-todo-select]');
const newTodoInput = document.querySelector('[data-new-todo-input]');

// Selector for edit todo form
const editTodoForm = document.querySelector('[data-edit-todo-form]');
const editTodoSelect = document.querySelector('[data-edit-todo-select]');
const editTodoInput = document.querySelector('[data-edit-todo-input]');

// Selector for todos container
const todosContainer = document.querySelector('[data-cards]');

// Local storage keys
const LOCAL_STORAGE_CATEGORIES_KEY = 'LOCAL_STORAGE_CATEGORIES_KEY';
const LOCAL_STORAGE_TODOS_KEY = 'LOCAL_STORAGE_TODOS_KEY';
const LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY = 'LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY';

let selectedCategoryId = localStorage.getItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY);
let categories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) || [];
let todos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TODOS_KEY)) || [];

// EVENT: Add Category
newCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = newCategoryInput.value;
    const isCategoryEmpty = !category || !category.trim().length;

    if (isCategoryEmpty) {
        return console.log('please enter a task');
    }

    categories.push({ _id: Date.now().toString(), category: category, color: getRandomHexColor() });

    newCategoryInput.value = '';

    saveAndRender();
});

// EVENT: Get Selected Category Id
categoriesContainer.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'li') {
        if (!e.target.dataset.categoryId) {
            selectedCategoryId = null;
        } else {
            selectedCategoryId = e.target.dataset.categoryId;
        }

        saveAndRender();
    }
});

// EVENT: Get Selected Category Color
categoriesContainer.addEventListener('change', (e) => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const newCategoryColor = e.target.value;
        const categoryId = e.target.parentElement.dataset.categoryId;
        const categoryToEdit = categories.find((category) => category._id === categoryId);

        categoryToEdit.color = newCategoryColor;

        saveAndRender();
    }
});

// EVENT: Delete Selected Category
currentlyViewing.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'span') {
        categories = categories.filter((category) => category._id !== selectedCategoryId);

        todos = todos.filter((todo) => todo.categoryId !== selectedCategoryId);

        selectedCategoryId = null;

        saveAndRender();
    }
});

// EVENT: Add Todo
newTodoForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    // get data from form / dom

    let formData = new FormData(document.querySelector('.create-todo-form'))

    console.log(formData)

    var object = {};
    formData.forEach(function(value, key) {
        object[key] = value;
    });

    let data = {
        "id": "8",
        "name": "Fa jer",
        "description": "Singing contest",
        "assignedto": "Anson Loo",
        "duedate": "29/5/2021",
        "status": "Pending"
    }

    const response = await fetch("http://localhost:8080/todolist/", {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        //mode: 'cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        //redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(object) // body data type must match "Content-Type" header
    });

    const json = await response.json()

    console.log(json)


    refresh()

    return

    todos.push({
        _id: Date.now().toString(),
        categoryId: newTodoSelect.value,
        todo: newTodoInput.value,
    });

    newTodoSelect.value = '';
    newTodoInput.value = '';

    saveAndRender();
});

// EVENT: Load Edit Todo Form With Values
let todoToEdit = null;
todosContainer.addEventListener('click', (e) => {
    if (e.target.classList[1] === 'fa-edit') {
        newTodoForm.style.display = 'none';
        editTodoForm.style.display = 'flex';

        todoToEdit = todos.find((todo) => todo._id === e.target.dataset.editTodo);

        editTodoSelect.value = todoToEdit.categoryId;
        editTodoInput.value = todoToEdit.todo;
    }
    if (e.target.classList[1] === 'fa-trash-alt') {
        const todoToDeleteIndex = todos.findIndex((todo) => todo._id === e.target.dataset.deleteTodo);

        todos.splice(todoToDeleteIndex, 1);

        saveAndRender();
    }
});

// EVENT: Update The Todo Being Edited With New Values
editTodoForm.addEventListener('submit', function(e) {
    e.preventDefault();

    todoToEdit.categoryId = editTodoSelect.value;
    todoToEdit.todo = editTodoInput.value;

    editTodoForm.style.display = 'none';
    newTodoForm.style.display = 'flex';

    editTodoSelect.value = '';
    editTodoInput.value = '';

    saveAndRender();
});

// *==================== Functions ====================

function saveAndRender() {
    save();
    render();
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    localStorage.setItem(LOCAL_STORAGE_TODOS_KEY, JSON.stringify(todos));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY, selectedCategoryId);
}

function render() {
    clearChildElements(categoriesContainer);
    clearChildElements(newTodoSelect);
    clearChildElements(editTodoSelect);
    clearChildElements(todosContainer);

    renderCategories();
    renderFormOptions();
    renderTodos();

    // Set the current viewing category
    if (!selectedCategoryId || selectedCategoryId === 'null') {
        currentlyViewing.innerHTML = `<strong>All Categories</strong>`;
    } else {
        const currentCategory = categories.find((category) => category._id === selectedCategoryId);
        currentlyViewing.innerHTML = `<strong>${currentCategory.category}</strong> <span>(DELETE)</span>`;
    }
}

function renderCategories() {
    categoriesContainer.innerHTML += `<li class="sidebar-item ${selectedCategoryId === 'null' || selectedCategoryId === null ? 'active' : ''}" data-category-id="">View All</li>
	`;

    categories.forEach(({ _id, category, color }) => {
        categoriesContainer.innerHTML += ` <li class="sidebar-item ${_id === selectedCategoryId ? 'active' : ''}" data-category-id=${_id}>${category}<input class="sidebar-color" type="color" value=${color}></li>`;
    });
}

function renderFormOptions() {

    newTodoSelect.innerHTML += `<option value="">Select</option>`;
    editTodoSelect.innerHTML += `<option value="">Select</option>`;

    categories.forEach(({ _id, category }) => {
        newTodoSelect.innerHTML += `<option value=${_id}>${category}</option>`;
        editTodoSelect.innerHTML += `<option value=${_id}>${category}</option>`;
    });
}

function renderTodos() {
    let todosToRender = todos;

    // if their is a Selected Category Id, and selected category id !== 'null then filter the todos
    if (selectedCategoryId && selectedCategoryId !== 'null') {
        todosToRender = todos.filter((todo) => todo.categoryId === selectedCategoryId);
    }

    // Render Todos
    todosToRender.forEach(({ _id, categoryId, todo }) => {

        // Get Complimentary categoryDetails Based On TaskId
        const { color, category } = categories.find(({ _id }) => _id === categoryId);
        const backgroundColor = convertHexToRGBA(color, 20);
        todosContainer.innerHTML += `
			<div class="todo">
					<div class="todo-tag">
						${category}
					</div>
					<p class="description">${todo}</p>
					<div class="todo-actions">
						<i class="far fa-edit" data-edit-todo=${_id}></i>
						<i class="far fa-trash-alt" data-delete-todo=${_id}></i>
					</div>
			</div>`;
    });
}

// HELPERS
function clearChildElements(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function convertHexToRGBA(hexCode, opacity) {
    let hex = hexCode.replace('#', '');

    if (hex.length === 3) {
        hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r},${g},${b},${opacity / 100})`;
}

function getRandomHexColor() {
    var hex = (Math.round(Math.random() * 0xffffff)).toString(16);
    while (hex.length < 6) hex = "0" + hex;
    return `#${hex}`;
}

window.addEventListener('load', render);


// [todo]
const fetchTodolist = document.querySelector('#showTodolist');
fetchTodolist.addEventListener('click', async(e) => {
    e.preventDefault();
    const data = await fetch('http://localhost:8080/todolist')
    const jsonResponse = await data.json()
    let displayArea = document.querySelector('#fetch-area')
        // let displayhtml = `<div>ID, Name, Description, Assigned to, Due Date, Status</div>`
    let displayhtml = ``
    for (let i of jsonResponse) {

        /*
        <div>
        <textarea id='id_${i}'>${i.id}</textarea>
        <textarea id='name_${i}'>${i.name}</textarea>
        <textarea id='description_${i}'>${i.description}</textarea>
        <textarea id='assignedto_${i}'>${i.assignedto}</textarea>
        <textarea id='duedate_${i}'>${i.duedate}</textarea>
        <textarea id='status_${i}'>${i.status}</textarea>
        <BR>
        <button class='button edit'>EDIT</button>
        <button class='button delete'>DELETE</button>
        <hr>
        </div>
        */


        displayhtml = displayhtml + `
            <section class="todos-container d-inline-flex" data-cards>
            <div class="todo">
            <div class="todo-tag">
            TO-DO List${i.id}
            </div>
            <h1 <class="card-title">No.${i.id}</h1>
            <p class="card-text">Task Name: ${i.name}</p>
            <p class="card-text">Task Description: ${i.description}</p>
            <p class="card-text">Assigned To: ${i.assignedto}</p>
            <p class="card-text">${i.duedate}</p>
            <p class="card-text ">${i.status}</p>
            <div class="todo-actions">
            <BR>
            <span id="edit-${i.id}"><i class="far fa-edit" onClick="editCard(${i.id})"></i></span>
            <span id="delete-${i.id}"><i class="far fa-trash-alt" onClick="deleteCard(${i.id})"></i></span>
            </div>
            </div>
            </section>                                           
            `
    }
    displayhtml = displayhtml + "<script src=.'/loadDelFunction.js'></script>";
    displayArea.innerHTML = displayhtml;
    console.log("data: " + document.querySelector("#delete-1"))
})

const refresh = async() => {
    const data = await fetch('http://localhost:8080/todolist')
    const jsonResponse = await data.json()
    let displayArea = document.querySelector('#fetch-area')
        // let displayhtml = `<div>ID, Name, Description, Assigned to, Due Date, Status</div>`
    let displayhtml = ``
    for (let i of jsonResponse) {

        /*
        <div>
        <textarea id='id_${i}'>${i.id}</textarea>
        <textarea id='name_${i}'>${i.name}</textarea>
        <textarea id='description_${i}'>${i.description}</textarea>
        <textarea id='assignedto_${i}'>${i.assignedto}</textarea>
        <textarea id='duedate_${i}'>${i.duedate}</textarea>
        <textarea id='status_${i}'>${i.status}</textarea>
        <BR>
        <button class='button edit'>EDIT</button>
        <button class='button delete'>DELETE</button>
        <hr>
        </div>
        */


        displayhtml = displayhtml + `
            <section class="todos-container d-inline-flex" data-cards>
            <div class="todo">
            <div class="todo-tag">
            TO-DO List
            </div>
            <h1 <class="card-title">No.${i.id}</h1>
            <p class="card-text">Task Name: ${i.name}</p>
            <p class="card-text">Task Description: ${i.description}</p>
            <p class="card-text">Assigned To: ${i.assignedto}</p>
            <p class="card-text">${i.duedate}</p>
            <p class="card-text ">${i.status}</p>
            <div class="todo-actions">
            <BR>
            <span id="edit-${i.id}"><i class="far fa-edit" onClick="editCard(${i.id})"></i></span>
            <span id="delete-${i.id}"><i class="far fa-trash-alt" onClick="deleteCard(${i.id})"></i></span>
            </div>
            </div>
            </section>                                           
            `
    }
    displayhtml = displayhtml + "<script src=.'/loadDelFunction.js'></script>";
    displayArea.innerHTML = displayhtml;
    console.log("datae: " + document.querySelector("#delete-1"))
}



const deleteCard = async(indexNumber) => {
    const res = await fetch('http://localhost:8080/todolist/' + indexNumber, {
        method: "DELETE",
        // headers: "",
        // body: JSON.stringify(i.id)
    })

    console.log(indexNumber)

    //const json = await res.json()

    refresh()
}

//var newScript = document.createElement("script");
//newScript.src = "./loadDelFunction.js";
//fetchTodolist.appendChild(newScript);

window.addEventListener('load', render);