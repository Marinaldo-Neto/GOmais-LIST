// START MODAL
function abrirModal() {
    let modal = new bootstrap.Modal(document.getElementById('modalCriarLista'));
    modal.show();
}
// END MODAL

// Função para mostrar um alerta estilizado
function showStyledAlert(title, message, confirmCallback) {
    // Criar o elemento do modal
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = 'confirmationModal';
    modalElement.setAttribute('tabindex', '-1');
    modalElement.setAttribute('aria-hidden', 'true');
    
    modalElement.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger" id="confirmBtn">Confirmar</button>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('confirmationModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    // Adicionar o modal ao body
    document.body.appendChild(modalElement);
    
    // Inicializar o modal
    const modal = new bootstrap.Modal(modalElement);
    
    document.getElementById('confirmBtn').addEventListener('click', function() {
        modal.hide();
        if (confirmCallback) {
            confirmCallback();
        }
        
        // Remover o modal após o uso
        setTimeout(() => {
            modalElement.remove();
        }, 500);
    });
    
    modal.show();
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        setTimeout(() => {
            modalElement.remove();
        }, 500);
    });
}


function showWelcomeScreen() {
    let mainContent = document.querySelector(".main-content");
    
    mainContent.innerHTML = `
        <div class="welcome-screen text-center">
            <h1 class="mb-4 fs-2 fs-md-1">Bem-vindo ao Go List!</h1>
            <p class="lead mb-5 fs-6 fs-md-5">Comece criando uma lista para organizar suas tarefas.</p>
            <button id="firstListBtn" class="btn btn-primary btn-lg mb-4">Primeira Lista</button>
            <div class="arrow-container">
                <i class="bi bi-arrow-up-circle-fill fs-3 fs-md-1 text-primary"></i>
                <p class="mt-2 small">Clique aqui para criar uma lista</p>
            </div>
        </div>
    `;
    
    const welcomeScreen = document.querySelector('.welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.marginTop = '100px';
    }
    
    const arrowContainer = document.querySelector('.arrow-container');
    if (arrowContainer) {
        arrowContainer.style.position = 'relative';
    }
    
    const firstListBtn = document.getElementById('firstListBtn');
    if (firstListBtn) {
        firstListBtn.addEventListener('click', function() {
            abrirModal();
        });
    }
}

function hideWelcomeScreen() {
    const welcomeScreen = document.querySelector('.welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.remove();
    }
}

function checkForEmptyLists() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    if (tasks.length === 0) {
        showWelcomeScreen();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    loadTasks();
    setupEventListeners();
    checkForEmptyLists();
});

function addTask() {
    let taskInput = document.getElementById("taskInput");
    let taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Por favor, digite um nome para a lista!");
        return;
    }

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(taskText);
    tasks = tasks.filter(task => task !== null && task !== undefined && task !== "" && typeof task === "string");

    localStorage.setItem("tasks", JSON.stringify(tasks));


    renderTask(taskText, "bi-file-earmark");
    taskInput.value = ""; 
    let modal = bootstrap.Modal.getInstance(document.getElementById("modalCriarLista"));
    modal.hide(); 
    hideWelcomeScreen();
    loadTaskDetails(taskText);
}


function renderTask(taskText, iconClass = "bi-file-earmark") {
 
    if (typeof taskText !== "string") return;
    
    let taskList = document.getElementById("taskList");

    let taskItem = document.createElement("a");
    taskItem.className = "nav-link text-truncate";
    taskItem.href = "#";
    taskItem.innerHTML = `

        <span class="icon">
            <i class="bi ${iconClass} icon-clickable" onclick="event.stopPropagation(); showIconSelector(this, '${taskText}');"></i>
        </span>

        <span class="description text-break" style="max-width: 85%; display: inline-block;">${taskText} 
            <i class="bi bi-trash" onclick="event.stopPropagation(); removeTask('${taskText}', this);"></i>
        </span>
    `;

    taskItem.addEventListener('click', () => {
        loadTaskDetails(taskText);
    });

    taskList.appendChild(taskItem);
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskIcons = JSON.parse(localStorage.getItem("taskIcons")) || {};

    tasks = tasks.filter(task => task !== null && task !== undefined && task !== "" && typeof task === "string");
    localStorage.setItem("tasks", JSON.stringify(tasks));
    
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    

    tasks.forEach(task => {
        const iconClass = taskIcons[task] || "bi-file-earmark";
        renderTask(task, iconClass);
    });
    
    checkForEmptyLists();
}

function removeTask(taskText, element) {
    showStyledAlert(
        "Confirmar exclusão", 
        `Tem certeza que deseja excluir a lista "${taskText}"?`,
        function() {
            let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
            tasks = tasks.filter(task => task !== taskText);
            tasks = tasks.filter(task => task !== null && task !== undefined && task !== "" && typeof task === "string");
            localStorage.setItem("tasks", JSON.stringify(tasks));
            
            let taskIcons = JSON.parse(localStorage.getItem("taskIcons")) || {};
            delete taskIcons[taskText];
            localStorage.setItem("taskIcons", JSON.stringify(taskIcons));

            element.closest(".nav-link").remove();
            
            checkForEmptyLists();
            
            const currentTitle = document.querySelector(".main-content h1");
            if (currentTitle && currentTitle.textContent === taskText) {
                showWelcomeScreen();
            }
        }
    );
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
        <div class="d-flex gap-2">
            <button type="button" class="btn btn-primary" id="markAllCompleted">Completar Todas as Tarefas</button>
            <button type="button" class="btn btn-danger" onclick="removeAllSubTasks('${taskText}')">Excluir Todas as Subtarefas</button>
        </div>
    `;

    loadSubTasks(taskText);
    setupEventListeners();
}

function addSubTask(taskText) {
    let subTaskInput = document.getElementById("nomeTask");
    let subTaskText = subTaskInput.value.trim();

    if (subTaskText === "") {

        return;
    }

    const uniqueId = 'task-' + Date.now();
    let subTaskList = document.getElementById("subTaskList");

    let subTaskItem = document.createElement("li");
    subTaskItem.className = "list-group-item border border-0";
    subTaskItem.innerHTML = `
        <div class="d-flex align-items-center">
            <input class="form-check-input me-2" type="checkbox" value="" id="${uniqueId}">
            <label class="form-check-label text-break flex-grow-1" for="${uniqueId}">${subTaskText}</label>
            <button class="btn btn-sm text-danger delete-btn p-0 ms-1" onclick="removeListItem(this)">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    subTaskList.appendChild(subTaskItem);

    
    const newCheckbox = subTaskItem.querySelector('input[type="checkbox"]');
    addCheckboxListener(newCheckbox);


    let subTasks = JSON.parse(localStorage.getItem(taskText)) || [];
    subTasks.push(subTaskText);
    subTasks = subTasks.filter(subTask => subTask !== null && subTask !== undefined && subTask !== "" && typeof subTask === "string");


    localStorage.setItem(taskText, JSON.stringify(subTasks));
    subTaskInput.value = "";
}




function loadSubTasks(taskText) {
    let subTasks = JSON.parse(localStorage.getItem(taskText)) || [];

    subTasks = subTasks.filter(subTask => subTask !== null && subTask !== undefined && subTask !== "" && typeof subTask === "string");
    
    localStorage.setItem(taskText, JSON.stringify(subTasks));
    
    subTasks.forEach(subTaskText => {
        const uniqueId = 'task-' + Date.now() + Math.random().toString(36).substr(2, 5);
        let subTaskList = document.getElementById("subTaskList");
        let subTaskItem = document.createElement("li");
        subTaskItem.className = "list-group-item border border-0";
        subTaskItem.innerHTML = `
            <div class="d-flex align-items-center">
                <input class="form-check-input me-2" type="checkbox" value="" id="${uniqueId}">
                <label class="form-check-label text-break flex-grow-1" for="${uniqueId}">${subTaskText}</label>
                <button class="btn btn-sm text-danger delete-btn p-0 ms-1" onclick="removeListItem(this)">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        subTaskList.appendChild(subTaskItem);
        
        const newCheckbox = subTaskItem.querySelector('input[type="checkbox"]');
        addCheckboxListener(newCheckbox);
    });
}



function removeListItem(button) {
    const listItem = button.closest('li');
    const taskText = listItem.querySelector('label').textContent;
    const taskList = listItem.parentElement;
    const itemIndex = Array.from(taskList.children).indexOf(listItem);
    const wasChecked = listItem.querySelector('input[type="checkbox"]').checked;
    
    const currentListTitle = document.querySelector("h1").textContent;
    let subTasks = JSON.parse(localStorage.getItem(currentListTitle)) || [];
    subTasks = subTasks.filter(item => item !== taskText);
    localStorage.setItem(currentListTitle, JSON.stringify(subTasks));
    
    const removedItem = {
        text: taskText,
        index: itemIndex,
        checked: wasChecked
    };
    
    const undoElement = document.createElement('li');
    undoElement.className = 'list-group-item border border-0';
    undoElement.innerHTML = `
        <input class="form-check-input me-1 invisible" type="checkbox">
        <span class="text-primary undo-link" style="cursor: pointer; font-style: italic;">Desfazer</span>
    `;
    
    taskList.replaceChild(undoElement, listItem);
    
    undoElement.querySelector('.undo-link').addEventListener('click', function() {
        restoreListItem(removedItem, undoElement, currentListTitle);
    });
    
    setTimeout(() => {
        if (undoElement.parentElement) {
            undoElement.remove();
        }
    }, 2000);
}

function restoreListItem(itemData, undoElement, currentListTitle) {
    const taskList = undoElement.parentElement;
    
    const restoredItem = document.createElement('li');
    restoredItem.className = 'list-group-item border border-0';
    
    const uniqueId = 'task-' + Date.now();
    restoredItem.innerHTML = `
        <div class="d-flex align-items-center">
            <input class="form-check-input me-2" type="checkbox" value="" id="${uniqueId}">
            <label class="form-check-label text-break flex-grow-1" for="${uniqueId}">${itemData.text}</label>
            <button class="btn btn-sm text-danger delete-btn p-0 ms-1" onclick="removeListItem(this)">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    taskList.replaceChild(restoredItem, undoElement);
    
    const checkbox = restoredItem.querySelector('input[type="checkbox"]');
    checkbox.checked = itemData.checked;
    addCheckboxListener(checkbox);
    
    if (itemData.checked) {
        const label = restoredItem.querySelector('label');
        label.style.textDecoration = 'line-through';
        label.style.color = 'var(--bs-secondary-color)';
    }
    
    let subTasks = JSON.parse(localStorage.getItem(currentListTitle)) || [];
    subTasks.push(itemData.text);
    localStorage.setItem(currentListTitle, JSON.stringify(subTasks));
}


function addCheckboxListener(checkbox) {
    checkbox.addEventListener('change', function() {
        const label = this.closest('li').querySelector('label');
        label.style.textDecoration = this.checked ? 'line-through' : 'none';
        label.style.color = this.checked ? 'var(--bs-secondary-color)' : '';
    });
}

function removeAllSubTasks(taskText) {


    showStyledAlert(
        "Confirmar exclusão", 
        "Tem certeza que deseja excluir todas as subtarefas?",
        function() {
            let subTasks = JSON.parse(localStorage.getItem(taskText)) || [];
            subTasks = []; // Esvazia o array de subtarefas
            localStorage.setItem(taskText, JSON.stringify(subTasks));




            let subTaskList = document.getElementById("subTaskList");
            subTaskList.innerHTML = ''; 
        }
    );
}

function setupEventListeners() {
    const addButton = document.querySelector('.add-task .btn-primary');
    if (addButton) {
        addButton.addEventListener('click', function() {
            const taskText = document.querySelector("h1").textContent;
            addSubTask(taskText);
        });
    }
    
    const taskInput = document.getElementById('nomeTask');
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e){
                if (e.key === 'Enter') {
                const taskText = document.querySelector("h1").textContent;
                addSubTask(taskText);
             } }

            );
    }
    
    document.querySelectorAll('.form-check-input').forEach(checkbox => {
        addCheckboxListener(checkbox);
    });
    

    const markCompletedButton = document.getElementById('markAllCompleted');
    if (markCompletedButton) {
        markCompletedButton.addEventListener('click', function() {
            document.querySelectorAll('.form-check-input').forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    const event = new Event('change', { bubbles: true });
                    checkbox.dispatchEvent(event);
                }
            });
        });
    }
}

function showIconSelector(iconElement, taskText) {
    const existingSelector = document.querySelector('.icon-selector');
    if (existingSelector) {
        existingSelector.remove();
    }
    
    const iconSelector = document.createElement('div');
    iconSelector.className = 'icon-selector';
    const availableIcons = [
        'bi-file-earmark', 'bi-list-ul', 'bi-check-square',

        'bi-calendar', 'bi-alarm', 'bi-bell', 'bi-heart',
        'bi-house', 'bi-cart', 'bi-bag', 'bi-briefcase',
        'bi-book', 'bi-bookmark', 'bi-envelope', 'bi-gift',
        'bi-lightbulb'
    ];
    
    availableIcons.forEach(icon => {
        const iconOption = document.createElement('i');
        iconOption.className = `bi ${icon}`;
        iconOption.addEventListener('click', () => {
            changeTaskIcon(taskText, icon, iconElement);
            iconSelector.remove();
        });
        iconSelector.appendChild(iconOption);
    });
    
    const rect = iconElement.getBoundingClientRect();
    iconSelector.style.top = `${rect.bottom + window.scrollY + 5}px`;
    iconSelector.style.left = `${rect.left + window.scrollX}px`;
    
    document.body.appendChild(iconSelector);
    
    document.addEventListener('click', function closeSelector(e) {
        if (!iconSelector.contains(e.target) && e.target !== iconElement) {
            iconSelector.remove();
            document.removeEventListener('click', closeSelector);
        }
    });
}

function changeTaskIcon(taskText, newIconClass, iconElement) {

    iconElement.className = `bi ${newIconClass} icon-clickable`;

    let taskIcons = JSON.parse(localStorage.getItem("taskIcons")) || {};
    taskIcons[taskText] = newIconClass;
    localStorage.setItem("taskIcons", JSON.stringify(taskIcons));
}
