// START MODAL
function abrirModal() {
    let modal = new bootstrap.Modal(document.getElementById('modalCriarLista'));
    modal.show();
}
// END MODAL

// Carrega as listas salvas ao iniciar a página
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
    localStorage.setItem("tasks", JSON.stringify(tasks));

    renderTask(taskText);
    taskInput.value = ""; // Limpa o campo de input
    let modal = bootstrap.Modal.getInstance(document.getElementById("modalCriarLista"));
    modal.hide(); // Fecha o modal
} 
// Adciona as Task no Submenu dinamico
function renderTask(taskText) {
    let taskList = document.getElementById("taskList");

    let taskItem = document.createElement("a");
    taskItem.className = "nav-link";
    taskItem.href = "#";
    taskItem.innerHTML = `
        <span class="icon"><i class="bi bi-file-earmark"></i></span>
        <span class="description">${taskText} <i class="bi bi-trash" onclick="removeTask('${taskText}', this)"></i></span>
    `;

    taskList.appendChild(taskItem);
}
// Load das Task do LocalStorege 
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => renderTask(task));
}

function removeTask(taskText, element) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter(task => task !== taskText);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    element.closest(".nav-link").remove();
}
