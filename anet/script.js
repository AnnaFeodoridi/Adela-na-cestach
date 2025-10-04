const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");

document.addEventListener("DOMContentLoaded", getLocalTodos);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", editCheck);
filterOption.addEventListener("change", filterTodo);

/* BATS */

function spawnBats(count = 6, options = {}) {
  const { side = "both", travelPx = 160, durationMs = [700, 1100], color = "#111" } = options;

  // ensure root container exists
  let root = document.querySelector(".bat-root");
  if (!root) {
    root = document.createElement("div");
    root.className = "bat-root";
    document.body.appendChild(root);
  }

  // SVG with separated wings for flap animation. Transparent background by default.
  const batSVG = (colorVar = "currentColor") => `
    <svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" width="100%" height="100%">
      <!-- left wing -->
      <g class="wing">
        <path d="M2 18 C10 12, 18 12, 26 18 C18 14, 10 14, 2 18 Z" />
      </g>
      <!-- right wing -->
      <g class="wing" transform="translate(38,0)">
        <path d="M2 18 C10 12, 18 12, 26 18 C18 14, 10 14, 2 18 Z" />
      </g>
      <!-- body (small) -->
      <g class="body-bob">
        <path d="M30 14 C32 10, 34 10, 36 14 C34 13, 32 13, 30 14 Z" />
      </g>
    </svg>`.trim();

  for (let i = 0; i < count; i++) {
    const s = (side === "both") ? (Math.random() < 0.5 ? "left" : "right") : side;

    const bat = document.createElement("div");
    bat.className = "bat bat--" + s;

    // insert svg
    bat.innerHTML = batSVG();

    // color (svg uses currentColor)
    bat.style.color = color;

    // Randomize per-bat CSS variables for variety
    const travel = Math.round(travelPx * (0.6 + Math.random() * 0.8)); // px
    const travelY = Math.round(6 + Math.random() * 26);                // vertical curve
    const rotStart = (s === "left") ? (-6 - Math.random() * 12) : (6 + Math.random() * 12);
    const rotMid   = (Math.random() < 0.5) ? (-4 + Math.random()*8) : (3 + Math.random()*6);
    const rotEnd   = (Math.random() < 0.5) ? (-2 + Math.random()*4) : (0);
    const scale    = (1.0 + Math.random() * 0.8).toFixed(2);


    const dur = durationMs[0] + Math.floor(Math.random() * (durationMs[1] - durationMs[0] + 1));
    const delay = Math.floor(Math.random() * 160);

    // set CSS vars
    bat.style.setProperty('--travel-x', `${travel}px`);
    bat.style.setProperty('--travel-y', `${travelY}px`);
    bat.style.setProperty('--rot-start', `${rotStart}deg`);
    bat.style.setProperty('--rot-mid', `${rotMid}deg`);
    bat.style.setProperty('--rot-end', `${rotEnd}deg`);
    bat.style.setProperty('--scale', scale);
    bat.style.setProperty('--dur', `${dur}ms`);
    bat.style.setProperty('--delay', `${delay}ms`);
    bat.style.setProperty('--flap-offset', `${Math.floor(Math.random()*90)}ms`);
    bat.style.setProperty('--bob-offset', `${Math.floor(Math.random()*180)}ms`);

    // duration & delay applied directly to element's animation properties
    bat.style.animationDuration = `${dur}ms`;
    bat.style.animationDelay = `${delay}ms`;
    bat.style.animationFillMode = "forwards";
    bat.style.animationIterationCount = 1;

    // vertical position near header/input area
    const headerEl = document.querySelector("header") || document.querySelector(".header") || document.body;
    const rect = headerEl.getBoundingClientRect();
    const topMin = Math.max(8, rect.top + 8);
    const topMax = Math.min(window.innerHeight - 40, rect.bottom + 24);
    const top = topMin + Math.random() * Math.max(1, topMax - topMin);
    bat.style.top = `${top}px`;

    // Set a visible final horizontal offset inside the viewport:
    const horizJitter = Math.floor(Math.random() * 60);
    if (s === "left") {
      bat.style.left = `${8 + horizJitter}px`;   // final position
    } else {
      bat.style.right = `${8 + horizJitter}px`;
    }

    // small initial scale (the animation keyframes include extra scale transforms)
    bat.style.transform = `scale(${scale})`;

    // attach and schedule removal
    root.appendChild(bat);
    const removeAfter = dur + delay + 300;
    setTimeout(() => {
      if (bat && bat.parentNode) bat.parentNode.removeChild(bat);
    }, removeAfter);
  }
}



/* ---------------- LocalStorage helpers (object-based) ---------------- */

// Load todos from localStorage
// Returns an array of objects
function loadTodos() {
  const raw = localStorage.getItem("todos");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    // If parsed is an array of strings (legacy), convert to objects
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
      const migrated = parsed.map(s => ({ id: Date.now().toString() + Math.random().toString(36).slice(2), text: s, completed: false }));
      localStorage.setItem("todos", JSON.stringify(migrated));
      return migrated;
    }
    // If already an array of objects, return it
    if (Array.isArray(parsed)) {
      // Basic validation: ensures each entry has id/text/completed, otherwise sanitize
      return parsed.map(item => {
        if (typeof item === "string") {
          return { id: Date.now().toString() + Math.random().toString(36).slice(2), text: item, completed: false };
        }
        return {
          id: item.id ? String(item.id) : Date.now().toString() + Math.random().toString(36).slice(2),
          text: item.text ? String(item.text) : "",
          completed: !!item.completed
        };
      });
    }
    // Fallback: not an array — reset
    return [];
  } catch (err) {
    console.error("Failed to parse todos from localStorage:", err);
    return [];
  }
}

function saveTodosArray(arr) {
  localStorage.setItem("todos", JSON.stringify(arr));
}

function saveLocalTodoObj(text) {
  const todos = loadTodos();
  const todoObj = { id: Date.now().toString() + Math.random().toString(36).slice(2), text, completed: false };
  todos.push(todoObj);
  saveTodosArray(todos);
  return todoObj;
}

function removeLocalTodoById(id) {
  let todos = loadTodos();
  todos = todos.filter(t => t.id !== id);
  saveTodosArray(todos);
}

function updateLocalTodoById(id, newText) {
  const todos = loadTodos();
  const idx = todos.findIndex(t => t.id === id);
  if (idx !== -1) {
    todos[idx].text = newText;
    saveTodosArray(todos);
  }
}

function toggleCompletedLocalTodoById(id, completed) {
  const todos = loadTodos();
  const idx = todos.findIndex(t => t.id === id);
  if (idx !== -1) {
    todos[idx].completed = !!completed;
    saveTodosArray(todos);
  }
}

/* ---------------- UI / App logic ---------------- */

function addTodo(event) {
    event.preventDefault();

    const text = todoInput.value.trim();
    if (text === "") {
        return;
    }

    // Create todo object and persist it first (so it has an id)
    const todoObj = saveLocalTodoObj(text);

    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    todoDiv.dataset.id = todoObj.id;
    if (todoObj.completed) todoDiv.classList.add("completed");

    const newTodo = document.createElement("li");
    newTodo.innerText = todoObj.text;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);

    // Button container
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

    // add to DOM
    todoList.appendChild(todoDiv);

    // spawn a subtle bat swarm for fun
    spawnBats(6, { side: "both", spreadPx: 140, durationMs: [700, 1100] });

    // clear input
    todoInput.value = "";
}

function editCheck(e) {
    const item = e.target;
    const todo = item.closest(".todo");
    if (!todo) return;

    const todoTextEl = todo.querySelector(".todo-item");

    if (item.classList.contains("trash-btn")) {
        // remove from storage by id
        const id = todo.dataset.id;
        todo.classList.add("slide");
        removeLocalTodoById(id);
        todo.addEventListener("transitionend", function () {
            todo.remove();
        });
    }

    if (item.classList.contains("complete-btn")) {
        todo.classList.toggle("completed");
        const id = todo.dataset.id;
        const completed = todo.classList.contains("completed");
        toggleCompletedLocalTodoById(id, completed);
    }

    if (item.classList.contains("edit-btn")) {
        const todoTextEl = todo.querySelector(".todo-item");
    
        if (todo.querySelector("input")) return;
    
        const input = document.createElement("input");
        input.type = "text";
        input.value = todoTextEl.innerText;
        input.classList.add("edit-input");
    
        // swap in the input
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
            if (e.key === "Escape") {
                // cancel edit
                todo.replaceChild(todoTextEl, input);
            }
        });
    
        function saveEdit() {
            const newText = input.value.trim();
            if (newText !== "") {
                const id = todo.dataset.id;
                updateLocalTodoById(id, newText);
                todoTextEl.innerText = newText;
                todo.replaceChild(todoTextEl, input);
            } else {
                // cancel (restore original)
                todo.replaceChild(todoTextEl, input);
            }
        }
    }
}

function filterTodo(e) {
    const todos = Array.from(todoList.children); // use children to avoid text nodes
    todos.forEach(function(todo) {
        switch(e.target.value) {
            case "all":
                todo.style.display = "flex";
                break;
            case "completed":
                if (todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
            case "incomplete":
                if (!todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
        }
    });
}

function getLocalTodos() {
    const todos = loadTodos();
    todos.forEach(function(todoObj) {
        const todoDiv = document.createElement("div");
        todoDiv.classList.add("todo");
        todoDiv.dataset.id = todoObj.id;
        if (todoObj.completed) todoDiv.classList.add("completed");

        const newTodo = document.createElement("li");
        newTodo.innerText = todoObj.text;
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
 
// helper used in edit input sizing
function getTextWidth(text, style) {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return context.measureText(text).width + 20;
}
