const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");

document.addEventListener("DOMContentLoaded", getLocalTodos);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", editCheck);
filterOption.addEventListener("change", filterTodo);

function addTodo(event) {
    event.preventDefault();

    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");

    const newTodo = document.createElement("li");
    newTodo.innerText = todoInput.value;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);

//Button container
    const btnGroup = document.createElement("div");
    btnGroup.classList.add("btn-group");

    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completedButton.classList.add("complete-btn");
    btnGroup.appendChild(completedButton);

    const editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-pen"></i>';
    editButton.classList.add("edit-btn");
    btnGroup.appendChild(editButton);

    const trashButton = document.createElement("button");
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add("trash-btn");
    btnGroup.appendChild(trashButton);

    todoDiv.appendChild(btnGroup);
    
    todoList.appendChild(todoDiv);
    todoInput.value = "";
}


function editCheck(e) {
    const item = e.target;
    const todo = item.closest(".todo");
    const todoTextEl = todo.querySelector(".todo-item");

    if (item.classList.contains("trash-btn")) {
        todo.classList.add("slide");
        removeLocalTodos(todo);
        todo.addEventListener("transitionend", function () {
            todo.remove();
        });
    }

    if (item.classList.contains("complete-btn")) {
        todo.classList.toggle("completed");
    }

    if (item.classList.contains("edit-btn")) {
        const todoTextEl = todo.querySelector(".todo-item");
    
        if (todo.querySelector("input")) return;
    
        const input = document.createElement("input");
        input.type = "text";
        input.value = todoTextEl.innerText;
        input.classList.add("edit-input");
    
        todo.replaceChild(input, todoTextEl);
    
        const style = window.getComputedStyle(todoTextEl);
        input.style.width = getTextWidth(input.value, style) + "px";
    
        input.addEventListener("input", () => {
            input.style.width = getTextWidth(input.value, style) + "px";
        });
    
        input.focus();
    
        input.addEventListener("blur", saveEdit);
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                input.blur();
            }
        });
    
        function saveEdit() {
            const newText = input.value.trim();
            if (newText !== "") {
                updateLocalTodo(todoTextEl.innerText, newText);
                todoTextEl.innerText = newText;
                todo.replaceChild(todoTextEl, input);
            } else {
                todo.replaceChild(todoTextEl, input);
            }
        }
    }
}

function filterTodo(e) {
    const todos = todoList.childNodes;
    todos.forEach(function(todo) {
        switch(e.target.value) {
            case "all": 
                todo.style.display = "flex";
                break;
            case "completed": 
                if(todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
            case "incomplete":
                if(!todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
        }
    });
}

function saveLocalTodos(todo) {
    let todos;
    if(localStorage.getItem("todos") === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem("todos"));
    }
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
}

function getLocalTodos() {
    let todos;
    if(localStorage.getItem("todos") === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem("todos"));
    }
    todos.forEach(function(todo) {
        const todoDiv = document.createElement("div");
        todoDiv.classList.add("todo");

        const newTodo = document.createElement("li");
        newTodo.innerText = todo;
        newTodo.classList.add("todo-item");
        todoDiv.appendChild(newTodo);

        const btnGroup = document.createElement("div");
        btnGroup.classList.add("btn-group");

        const completedButton = document.createElement("button");
        completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
        completedButton.classList.add("complete-btn");
        btnGroup.appendChild(completedButton);

        const editButton = document.createElement("button");
        editButton.innerHTML = '<i class="fas fa-pen"></i>';
        editButton.classList.add("edit-btn");
        btnGroup.appendChild(editButton);

        const trashButton = document.createElement("button");
        trashButton.innerHTML = '<i class="fas fa-trash"></i>';
        trashButton.classList.add("trash-btn");
        btnGroup.appendChild(trashButton);

        todoDiv.appendChild(btnGroup);

        todoList.appendChild(todoDiv);
    });
}

function removeLocalTodos(todo) {
    let todos;
    if(localStorage.getItem("todos") === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem("todos"));
    }

    const todoIndex = todo.children[0].innerText;
    todos.splice(todos.indexOf(todoIndex), 1);
    localStorage.setItem("todos", JSON.stringify(todos));
}

function updateLocalTodo(oldText, newText) {
    let todos = JSON.parse(localStorage.getItem("todos")) || [];
    const index = todos.indexOf(oldText);
    if (index !== -1) {
        todos[index] = newText;
        localStorage.setItem("todos", JSON.stringify(todos));
    }
}

function getTextWidth(text, style) {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return context.measureText(text).width + 20;
}