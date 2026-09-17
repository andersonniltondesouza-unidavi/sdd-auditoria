document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const titleInput = document.getElementById('task-title');
    const descInput = document.getElementById('task-desc');
    const columns = document.querySelectorAll('.kanban-column');
    
    // Inicializa o array de tarefas a partir do LocalStorage (ou array vazio)
    let tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || [];

    // Salva as tarefas no LocalStorage
    function saveTasks() {
        localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
    }

    // Renderiza os cartões na tela nas colunas correspondentes
    function renderTasks() {
        // Limpa todas as colunas antes de recriar
        document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.draggable = true;
            card.dataset.id = task.id;

            card.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.desc}</p>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Excluir Tarefa</button>
            `;

            // Eventos de arrastar do card
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);

            // Encontra a coluna correta e adiciona o card
            const column = document.querySelector(`.kanban-column[data-status="${task.status}"] .task-list`);
            if (column) {
                column.appendChild(card);
            }
        });
    }

    // Função global para excluir tarefa
    window.deleteTask = function(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    };

    // Cadastro de nova tarefa
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newTask = {
            id: Date.now(),
            title: titleInput.value,
            desc: descInput.value,
            status: 'aberto' // Toda tarefa nova entra 'Em Aberto'
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        // Limpa o formulário
        taskForm.reset();
        titleInput.focus();
    });

    // --- Implementação do Drag and Drop ---
    let draggedCard = null;

    function handleDragStart(e) {
        draggedCard = this;
        this.classList.add('dragging');
        // Transfere o ID via dataTransfer por segurança/compatibilidade
        e.dataTransfer.setData('text/plain', this.dataset.id);
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedCard = null;
        
        // Remove estado de hover de todas as colunas
        columns.forEach(col => col.querySelector('.task-list').classList.remove('drag-over'));
    }

    // Configurando as colunas para aceitarem drop
    columns.forEach(column => {
        const taskList = column.querySelector('.task-list');

        column.addEventListener('dragover', e => {
            e.preventDefault(); // Necessário para permitir o drop
            taskList.classList.add('drag-over');
        });

        column.addEventListener('dragleave', e => {
            taskList.classList.remove('drag-over');
        });

        column.addEventListener('drop', e => {
            e.preventDefault();
            taskList.classList.remove('drag-over');
            
            if (draggedCard) {
                const newStatus = column.dataset.status;
                const taskId = parseInt(draggedCard.dataset.id);
                
                // Atualiza o status da tarefa no array e no storage
                const taskIndex = tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].status = newStatus;
                    saveTasks();
                }
                
                // Move visualmente o card para a nova lista
                taskList.appendChild(draggedCard);
            }
        });
    });

    // Primeira renderização ao carregar a página
    renderTasks();
});

