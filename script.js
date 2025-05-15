// Initialize FullCalendar
const calendarEl = document.getElementById('calendar');
const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: 'dayGridMonth',
  dateClick: function(info) {
    showTasksForDate(info.dateStr);
  },
  eventClick: function(info) {
    alert('Task: ' + info.event.title);
  }
});
calendar.render();

// Load saved tasks on page load
window.onload = function () {
  loadTasks();
  applySavedTheme();
  calendar.render();
  setReminder();
};

// Add a task with category and priority
function addTask() {
  const input = document.getElementById("taskInput");
  const dateInput = document.getElementById("dueDateInput");
  const priorityInput = document.getElementById("priorityInput");
  const categoryInput = document.getElementById("categoryInput");
  const taskText = input.value.trim();
  const dueDate = dateInput.value;
  const priority = priorityInput.value;
  const category = categoryInput.value;

  if (taskText === "") {
    alert("Please enter a task.");
    return;
  }

  const task = {
    text: taskText,
    completed: false,
    dueDate: dueDate || null,
    priority: priority || "Low",
    category: category || "Work",
  };

  const tasks = getSavedTasks();
  tasks.push(task);
  saveTasks(tasks);
  renderTasks();

  // Add the task to the calendar
  if (dueDate) {
    calendar.addEvent({
      title: taskText,
      start: dueDate,
      allDay: true,
      color: getPriorityColor(priority),
    });
  }

  input.value = "";
  dateInput.value = "";
  priorityInput.value = "Low";
  categoryInput.value = "Work";  // Reset the category dropdown
}

// Render tasks with categories
function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  const tasks = getSavedTasks();

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.add("fade-in");
    if (task.completed) li.classList.add("completed");

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const span = document.createElement("span");
    span.textContent = task.text;
    span.onclick = function () {
      tasks[index].completed = !tasks[index].completed;
      saveTasks(tasks);
      renderTasks();
    };

    taskInfo.appendChild(span);

    if (task.dueDate) {
      const due = document.createElement("div");
      due.className = "task-date";
      due.textContent = `Due: ${task.dueDate}`;
      taskInfo.appendChild(due);
    }

    const category = document.createElement("div");
    category.className = "task-category";
    category.textContent = `Category: ${task.category}`;
    taskInfo.appendChild(category);

    // Set task priority color
    taskInfo.classList.add(getPriorityClass(task.priority));

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = function () {
      const newText = prompt("Edit your task:", task.text);
      if (newText !== null && newText.trim() !== "") {
        tasks[index].text = newText.trim();
        saveTasks(tasks);
        renderTasks();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = function () {
      tasks.splice(index, 1);
      saveTasks(tasks);
      renderTasks();
      calendar.getEvents().forEach(event => {
        if (event.startStr === task.dueDate && event.title === task.text) {
          event.remove();
        }
      });
    };

    li.appendChild(taskInfo);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function getPriorityClass(priority) {
  if (priority === "High") return "task-high-priority";
  if (priority === "Medium") return "task-medium-priority";
  return "task-low-priority";
}

function getPriorityColor(priority) {
  if (priority === "High") return "#FF6347"; // Red
  if (priority === "Medium") return "#FFA500"; // Orange
  return "#32CD32"; // Green
}

// Save tasks to local storage
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Get tasks from local storage
function getSavedTasks() {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}

// Load tasks from local storage
function loadTasks() {
  renderTasks();
}

// Show tasks for a specific date
function showTasksForDate(dateStr) {
  const tasks = getSavedTasks();
  const tasksOnDate = tasks.filter(task => task.dueDate === dateStr);

  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasksOnDate.forEach(task => {
    const li = document.createElement("li");
    li.classList.add("fade-in");

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const span = document.createElement("span");
    span.textContent = task.text;
    taskInfo.appendChild(span);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = function () {
      const allTasks = getSavedTasks();
      const updatedTasks = allTasks.filter(t => t !== task);
      saveTasks(updatedTasks);
      renderTasks();
      calendar.getEvents().forEach(event => {
        if (event.startStr === task.dueDate && event.title === task.text) {
          event.remove();
        }
      });
    };

    li.appendChild(taskInfo);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

// Dark mode toggle
document.getElementById("toggleDarkMode").onclick = function () {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
};

function applySavedTheme() {
  const mode = localStorage.getItem("darkMode");
  if (mode === "enabled") {
    document.body.classList.add("dark");
  }
}

// Filter tasks based on search input
function filterTasks() {
  const searchTerm = document.getElementById("searchBar").value.toLowerCase();
  const tasks = getSavedTasks();
  const filteredTasks = tasks.filter(task => {
    return task.text.toLowerCase().includes(searchTerm) || task.category.toLowerCase().includes(searchTerm);
  });
  renderFilteredTasks(filteredTasks);
}

function renderFilteredTasks(filteredTasks) {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.classList.add("fade-in");
    if (task.completed) li.classList.add("completed");

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const span = document.createElement("span");
    span.textContent = task.text;
    span.onclick = function () {
      task.completed = !task.completed;
      saveTasks(getSavedTasks());
      renderFilteredTasks(filteredTasks);
    };

    taskInfo.appendChild(span);

    const category = document.createElement("div");
    category.className = "task-category";
    category.textContent = `Category: ${task.category}`;
    taskInfo.appendChild(category);

    taskInfo.classList.add(getPriorityClass(task.priority));

    li.appendChild(taskInfo);
    taskList.appendChild(li);
  });
}
