// START MODAL
function abrirModal() {
    let modal = new bootstrap.Modal(document.getElementById('modalCriarLista'));
    modal.show();
}
// END MODAL
document.addEventListener("DOMContentLoaded", loadTasks);

function addTask() {
    let taskInput = document.getElementById("taskInput");
    let taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Por favor, digite um nome para a lista!");
        return;
    }

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(taskText);
    tasks = tasks.filter(task => task !== null && task !== undefined && task !== "");

    localStorage.setItem("tasks", JSON.stringify(tasks));

    renderTask(taskText);
    taskInput.value = ""; // Limpa o campo de input
    let modal = bootstrap.Modal.getInstance(document.getElementById("modalCriarLista"));
    modal.hide(); // Fecha o modal
}

function renderTask(taskText) {
    let taskList = document.getElementById("taskList");

    let taskItem = document.createElement("a");
    taskItem.className = "nav-link";
    taskItem.href = "#";
    taskItem.innerHTML = `
        <span class="icon"><i class="bi bi-file-earmark"></i></span>
        <span class="description">${taskText} <i class="bi bi-trash" onclick="removeTask('${taskText}', this)"></i></span>
    `;

    taskItem.addEventListener('click', () => {
        loadTaskDetails(taskText);
    });

    taskList.appendChild(taskItem);
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter(task => task !== null && task !== undefined && task !== "");
    tasks.forEach(task => renderTask(task));
}

function removeTask(taskText, element) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter(task => task !== taskText);
    tasks = tasks.filter(task => task !== null && task !== undefined && task !== "");
    localStorage.setItem("tasks", JSON.stringify(tasks));

    element.closest(".nav-link").remove();
}

function loadTaskDetails(taskText) {
    let mainContent = document.querySelector(".main-content");
    
    mainContent.innerHTML = `
        <h1>${taskText}</h1>
        <hr>
        <div class="add-task">
            <input type="text" id="nomeTask" class="form-control" placeholder="Adicionar atividade" aria-label="Adicionar atividade">
            <button type="button" class="btn btn-primary" onclick="addSubTask('${taskText}')"><i class="bi bi-plus-lg"></i></button>
        </div>
        <br>
        <ul id="subTaskList" class="list-group"></ul>
        <br>
        <button type="button" class="btn btn-danger" onclick="removeAllSubTasks('${taskText}')">Excluir Todas as Subtarefas</button>
    `;

    loadSubTasks(taskText);
}

function addSubTask(taskText) {
    let subTaskInput = document.getElementById("nomeTask");
    let subTaskText = subTaskInput.value.trim();

    if (subTaskText === "") {
        alert("Por favor, digite uma descrição para a atividade!");
        return;
    }

    let subTasks = JSON.parse(localStorage.getItem(taskText)) || [];
    subTasks.push(subTaskText);
    subTasks = subTasks.filter(subTask => subTask !== null && subTask !== undefined && subTask !== "");

    localStorage.setItem(taskText, JSON.stringify(subTasks));

    renderSubTask(subTaskText);
    subTaskInput.value = ""; // Limpa o campo de input
}

function renderSubTask(subTaskText) {
    let subTaskList = document.getElementById("subTaskList");

    let subTaskItem = document.createElement("li");
    subTaskItem.className = "list-group-item border border-0";
    subTaskItem.innerHTML = `
        <input class="form-check-input me-1" type="checkbox" value="">
        <label class="form-check-label">${subTaskText}</label>
        <button class="btn btn-danger btn-sm float-end" onclick="removeSubTask('${subTaskText}')">Excluir</button>
    `;

    subTaskList.appendChild(subTaskItem);
}

function loadSubTasks(taskText) {
    let subTasks = JSON.parse(localStorage.getItem(taskText)) || [];
    subTasks = subTasks.filter(subTask => subTask !== null && subTask !== undefined && subTask !== "");
    subTasks.forEach(subTask => renderSubTask(subTask));
}

// Remove uma subtask específica
function removeSubTask(subTaskText) {
    let taskText = document.querySelector("h1").textContent;
    let subTasks = JSON.parse(localStorage.getItem(taskText)) || [];
    subTasks = subTasks.filter(subTask => subTask !== subTaskText);
    subTasks = subTasks.filter(subTask => subTask !== null && subTask !== undefined && subTask !== "");
    localStorage.setItem(taskText, JSON.stringify(subTasks));

    // Remove a subtask do DOM
    let subTaskList = document.getElementById("subTaskList");
    let subTaskItem = Array.from(subTaskList.getElementsByTagName("li")).find(item => item.textContent.includes(subTaskText));
    if (subTaskItem) {
        subTaskItem.remove();
    }
}

// Remove todas as subtarefas
function removeAllSubTasks(taskText) {
    let subTasks = JSON.parse(localStorage.getItem(taskText)) || [];
    subTasks = []; // Esvazia o array de subtarefas
    localStorage.setItem(taskText, JSON.stringify(subTasks));

    // Remove todas as subtarefas do DOM
    let subTaskList = document.getElementById("subTaskList");
    subTaskList.innerHTML = ''; // Limpa a lista
}
