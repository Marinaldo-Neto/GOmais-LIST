// START MODAL
function abrirModal() {
    let modal = new bootstrap.Modal(document.getElementById('modalCriarLista'));
    modal.show();
}
// END MODAL
//Da upload em todas as task.
loadTasks();
renderCompletedTasks();
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


//ADICIONA AS LISTAS
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
    loadTaskDetails(taskText);
    location.reload();

}

//RENDERIZA AS LISTAS
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
        <span class="description" title="${taskText}">${taskText}</span>
        <i class="bi bi-trash ms-auto" style="font-size: 0.8rem;" onclick="event.stopPropagation(); removeTask('${taskText}', this);"></i>
    `;

    taskItem.addEventListener('click', () => {
        loadTaskDetails(taskText);
    });

    taskList.appendChild(taskItem);
}
//CARREGA AS LISTAS
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
//REMOVER LISTA
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

            // Remover as subtasks associadas à task
            localStorage.removeItem(taskText);

            element.closest(".nav-link").remove();
        
            const currentTitle = document.querySelector(".main-content h1");

            if (tasks.length === 0 || (currentTitle && currentTitle.textContent === taskText)) {
                window.location.href = "index.html";
            }
        }
    );

}

// HTML DAS PÁGINAS DAS TODO LIST
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
        <div class="control-task">
          <button type="button" class="task-buttons btn btn-primary" onclick="markTaskCompleted('${taskText}')">Marcar como Concluído</button>
          <button type="button" class="task-buttons btn btn-danger" onclick="removeAllSubTasks('${taskText}')">Excluir todas as Tarefas</button>
        </div>
    `;

    loadSubTasks(taskText);
    setupEventListeners();
}
 // ADICIONA AS TASKS
function addSubTask(taskText) {
    let subTaskInput = document.getElementById("nomeTask");
    let subTaskText = subTaskInput.value.trim();

    if (subTaskText === "") {

        return;
    }

    const uniqueId = 'task-' + Date.now();
    let subTaskList = document.getElementById("subTaskList");

    // HTML DAS TASKS
    let subTaskItem = document.createElement("li");
    subTaskItem.className = "list-group-item border border-0";
    subTaskItem.innerHTML = `
        <div class="d-flex align-items-center">
            <input class="mt-0 form-check-input me-2" type="checkbox" value="" id="${uniqueId}">
            <label class="form-check-label text-break me-2" for="${uniqueId}">${subTaskText}</label>
            <button class="btn btn-sm text-danger delete-btn p-0" onclick="removeListItem(this)">
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



//CARREGA AS TASKS
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
                <input class="mt-0 form-check-input me-2" type="checkbox" value="" id="${uniqueId}">
                <label class="form-check-label text-break me-2" for="${uniqueId}">${subTaskText}</label>
                <button class="btn btn-sm text-danger delete-btn p-0" onclick="removeListItem(this)">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        subTaskList.appendChild(subTaskItem);
        
        const newCheckbox = subTaskItem.querySelector('input[type="checkbox"]');
        addCheckboxListener(newCheckbox);
    });
}


//REMOVE AS TASKS
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
// RESTAURAR OS ITEMS DAS TASKS
function restoreListItem(itemData, undoElement, currentListTitle) {
    const taskList = undoElement.parentElement;
    
    const restoredItem = document.createElement('li');
    restoredItem.className = 'list-group-item border border-0';
    
    const uniqueId = 'task-' + Date.now();
    restoredItem.innerHTML = `
        <div class="d-flex align-items-center">
            <input class="mt-0 form-check-input me-2" type="checkbox" value="" id="${uniqueId}">
            <label class="form-check-label text-break me-2" for="${uniqueId}">${itemData.text}</label>
            <button class="btn btn-sm text-danger delete-btn p-0" onclick="removeListItem(this)">
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
// REMOVER TODAS AS SUBTAREFAS
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

function removeSubTask(subTaskText) {
    let taskText = document.querySelector("h1").textContent;
    let tasks = JSON.parse(localStorage.getItem("tasks")) || {};
    tasks[taskText] = tasks[taskText].filter(subTask => subTask !== subTaskText);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    let subTaskList = document.getElementById("subTaskList");
    let subTaskItem = Array.from(subTaskList.getElementsByTagName("li")).find(item => item.textContent.includes(subTaskText));
    if (subTaskItem) {
        subTaskItem.remove();
    }
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
//MOSTRA OS ICONES 
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
//FUNÇAO QUE MUDA OS ICONES
function changeTaskIcon(taskText, newIconClass, iconElement) {

    iconElement.className = `bi ${newIconClass} icon-clickable`;

    let taskIcons = JSON.parse(localStorage.getItem("taskIcons")) || {};
    taskIcons[taskText] = newIconClass;
    localStorage.setItem("taskIcons", JSON.stringify(taskIcons));
}

function markTaskCompleted(taskText) {
    showStyledAlert(
        "Confirmar conclusão", 
        `Deseja marcar a lista "${taskText}" como concluída?`,
        function() {
            let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
            let completedTasks = JSON.parse(localStorage.getItem("tasksConcluidas")) || [];

            const newTasks = tasks.filter(task => task !== taskText);
            const newCompletedTasks = [...new Set([...completedTasks, taskText])]; // Evita duplicatas

            localStorage.setItem("tasks", JSON.stringify(newTasks));
            localStorage.setItem("tasksConcluidas", JSON.stringify(newCompletedTasks));
            
            // Atualizar a interface sem redirecionar
            let taskList = document.getElementById("taskList");
            if (taskList) {
                // Remover a tarefa da lista de tarefas ativas
                const taskElements = taskList.querySelectorAll('.nav-link');
                taskElements.forEach(element => {
                    if (element.querySelector('.description').textContent === taskText) {
                        element.remove();
                    }
                });
            }
            
            let completedTaskList = document.getElementById("completedTaskList");

            renderCompletedTasks();
            window.location.href = "index.html";
        }
    );
}
function loadCompletedTasks() {
    let completedTasks = JSON.parse(localStorage.getItem("tasksConcluidas")) || [];
    let taskIcons = JSON.parse(localStorage.getItem("taskIcons")) || {};

    let completedTaskList = document.getElementById("completedTaskList");
    completedTaskList.innerHTML = "";

    completedTasks.forEach(taskText => {
        const iconClass = taskIcons[taskText] || "bi-check-circle-fill";
        renderCompletedTask(taskText, iconClass);
    });
}
function renderCompletedTasks() {
    let completedTasks = JSON.parse(localStorage.getItem("tasksConcluidas")) || [];
    let taskIcons = JSON.parse(localStorage.getItem("taskIcons")) || {};
    let completedTaskList = document.getElementById("completedTaskList");
    
    // Limpa a lista antes de renderizar novamente
    completedTaskList.innerHTML = "";

    completedTasks.forEach(taskText => {
        if (typeof taskText !== "string") return;
        
        const iconClass = taskIcons[taskText] || "bi-check-circle-fill";
        
        let taskItem = document.createElement("a");
        taskItem.className = "nav-link text-truncate";
        taskItem.href = "#";
        taskItem.innerHTML = `
            <span class="icon">
                <i class="bi ${iconClass}"></i>
            </span>
            <span class="description" title="${taskText}">${taskText}</span>
            <i class="bi bi-trash ms-auto" style="font-size: 0.8rem;" 
               onclick="event.stopPropagation(); removeCompletedTask('${taskText}', this);"></i>
        `;

        // Adiciona um evento de clique para visualizar a tarefa concluída
        taskItem.addEventListener('click', () => {
            viewCompletedTask(taskText);
        });

        completedTaskList.appendChild(taskItem);
    });
    
    // Verifica se há tarefas concluídas para mostrar/ocultar a seção
    checkForEmptyLists();
}

// Função para visualizar uma tarefa concluída
function viewCompletedTask(taskText) {
    let mainContent = document.querySelector(".main-content");
    
    mainContent.innerHTML = `
        <h1>${taskText} <span class="badge bg-success">Concluída</span></h1>
        <hr>
        <div class="alert alert-success">
            Esta lista foi marcada como concluída.
        </div>
        <button type="button" class="btn btn-secondary" onclick="reopenTask('${taskText}')">
            Reabrir Lista
        </button>
    `;
}

// Função para remover uma tarefa concluída
function removeCompletedTask(taskText, element) {
    showStyledAlert(
        "Confirmar exclusão", 
        `Tem certeza que deseja excluir permanentemente a lista concluída "${taskText}"?`,
        function() {
            let completedTasks = JSON.parse(localStorage.getItem("tasksConcluidas")) || [];
            completedTasks = completedTasks.filter(task => task !== taskText);
            localStorage.setItem("tasksConcluidas", JSON.stringify(completedTasks));
            
            // Remove também do armazenamento de ícones se desejar
            let taskIcons = JSON.parse(localStorage.getItem("taskIcons")) || {};
            delete taskIcons[taskText];
            localStorage.setItem("taskIcons", JSON.stringify(taskIcons));

            localStorage.removeItem(taskText);

            // Remove o item da lista na interface
            element.closest(".nav-link").remove();
            
            // Verifica se há listas vazias
            checkForEmptyLists();
            window.location.href = "index.html";
        }
    );
}

// Função para reabrir uma tarefa concluída
function reopenTask(taskText) {
    showStyledAlert(
        "Reabrir lista", 
        `Deseja reabrir a lista "${taskText}"? Ela será movida de volta para Pendentes.`,
        function() {
            let completedTasks = JSON.parse(localStorage.getItem("tasksConcluidas")) || [];
            let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
            
            // Remove da lista de concluídas
            completedTasks = completedTasks.filter(task => task !== taskText);
            
            // Adiciona de volta à lista de pendentes (se já não estiver lá)
            if (!tasks.includes(taskText)) {
                tasks.push(taskText);
            }
            
            localStorage.setItem("tasksConcluidas", JSON.stringify(completedTasks));
            localStorage.setItem("tasks", JSON.stringify(tasks));
            
            // Atualiza ambas as listas na interface
            loadTasks();
            renderCompletedTasks();
            
            // Volta para a página inicial
            window.location.href = "index.html";
        }
    );
}

// Função para verificar listas vazias e ajustar a interface
function checkForEmptyLists() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const completedTasks = JSON.parse(localStorage.getItem("tasksConcluidas")) || [];
    
    // Esconde o submenu de pendentes se não houver tarefas
    const submenuPendentes = document.querySelector("#submenu");
    if (tasks.length === 0) {
        submenuPendentes.style.display = "none";
    } else {
        submenuPendentes.style.display = "block";
    }
    
    // Esconde o submenu de concluídas se não houver tarefas
    const submenuConcluidas = document.querySelector("#completedTaskList").parentElement;
    if (completedTasks.length === 0) {
        submenuConcluidas.style.display = "none";
    } else {
        submenuConcluidas.style.display = "block";
    }
}



