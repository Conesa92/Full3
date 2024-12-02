let selectedPanelId = null;

const fetchGraphQL = async (query, variables = {}) => {
    const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    
    if (result.errors) {
        console.error('Errores de GraphQL:', result.errors);
        alert('Error de GraphQL: ' + JSON.stringify(result.errors)); // Verificar errores visualmente
    }

    return result.data;
};

const loadPanels = async () => {
    const query = `query GetPanels {
        getPanels {
            id
            name
        }
    }`;

    try {
        const data = await fetchGraphQL(query);
        const panelButtonsContainer = document.getElementById('panelButtons');
        panelButtonsContainer.innerHTML = ''; // Limpiar los botones de paneles anteriores

        data.getPanels.forEach(panel => {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-outline-primary', 'panel-button');
            button.innerText = panel.name;
            button.onclick = () => {
                selectedPanelId = panel.id;
                loadTasksForPanel(panel.id, panel.name);  // Llamada a la función que carga las tareas
                selectPanelButton(button);
            };
            panelButtonsContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Error al cargar los paneles:', error);
    }
};

const selectPanelButton = (selectedButton) => {
    const allButtons = document.querySelectorAll('.panel-button');
    allButtons.forEach(button => button.classList.remove('selected'));
    selectedButton.classList.add('selected');
};

const loadTasksForPanel = async (panelId, panelName) => {
    const query = `query GetTasksByPanel($panelId: ID!) {
        getTasksByPanel(panelId: $panelId) {
            id
            name
            description
            date
            responsible
            status
            fileUrl
        }
    }`;

    try {
        const data = await fetchGraphQL(query, { panelId });

        // Limpiar las listas de tareas previas
        document.getElementById('todoList').innerHTML = '';
        document.getElementById('inProgressList').innerHTML = '';
        document.getElementById('doneList').innerHTML = '';

        const noTasksMessage = document.createElement('p');
        noTasksMessage.classList.add('text-center', 'text-muted');

        if (data.getTasksByPanel.length === 0) {
            // Si no hay tareas, mostrar mensaje
            noTasksMessage.textContent = 'Este panel no tiene tareas aún.';
            document.getElementById('todoList').appendChild(noTasksMessage);
        } else {
            // Si hay tareas, mostrarlas
            data.getTasksByPanel.forEach(task => {
                console.log("Fecha de tarea:", task.date);  // Verificar la fecha que llega
                const formattedDate = convertDate(task.date);
                
            
                const taskCard = document.createElement('div');
                taskCard.classList.add('card', 'task-card');
                taskCard.id = task.id;
                taskCard.dataset.status = task.status;
            
                let fileHtml = '';
                if (task.fileUrl) {
                    fileHtml = `<p><strong>Archivo:</strong> <a href="${task.fileUrl}" target="_blank">Ver archivo</a></p>`;
                }
            
                taskCard.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${task.name}</h5>
                        <p class="card-text">${task.description}</p>
                        <p><strong>Responsable:</strong> ${task.responsible}</p>
                        <p><strong>Fecha:</strong> ${formattedDate}</p>
                        ${fileHtml}
                        <div class="task-actions">
                            <button class="btn btn-sm btn-warning" onclick="editTask('${task.id}')">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTask('${task.id}')">Eliminar</button>
                        </div>
                    </div>
                `;
                
                // Asignar tareas a la lista correspondiente según su estado
                if (task.status === 'Por hacer') {
                    document.getElementById('todoList').appendChild(taskCard);
                } else if (task.status === 'En proceso') {
                    document.getElementById('inProgressList').appendChild(taskCard);
                } else if (task.status === 'Terminado') {
                    document.getElementById('doneList').appendChild(taskCard);
                }
            });
        }

        // Mostrar la sección de tareas y el título del panel
        const taskSection = document.getElementById('taskSection');
        taskSection.classList.remove('d-none');
        document.getElementById('selectedPanelTitle').innerText = `Tareas de: ${panelName}`;

        const createTaskButton = document.querySelector('#taskSection button');
        createTaskButton.classList.remove('d-none');  // Mostrar el botón de "Crear Nueva Tarea"

    } catch (error) {
        console.error('Error al cargar las tareas del panel:', error);
    }
};

   
        //Función para convertir la fecha del formato DD/MM/YYYY a YYYY-MM-DD
        const convertDate = (date) => {
            if (!date || (isNaN(date) && isNaN(Date.parse(date)))) {
                console.error('Fecha no válida:', date);
                return 'Fecha no disponible';  // Retorna un mensaje en lugar de una cadena vacía
            }

            // Si la fecha es un número (timestamp), la convertimos a un objeto Date
            const dateObj = (isNaN(date)) ? new Date(date) : new Date(parseInt(date)); // Si es un número, convertirlo a Date

            return dateObj.toISOString().split('T')[0]; // Devuelve la fecha en formato YYYY-MM-DD
        };

        let editingTaskId = null; // Variable para almacenar el ID de la tarea que se está editando

        // Función para abrir el modal con datos de la tarea seleccionada
        const editTask = async (taskId) => {
            console.log('ID de tarea a editar:', taskId);
            const query = `
                query GetTask($id: ID!) {
                    getTask(id: $id) {
                        id
                        name
                        description
                        date
                        responsible
                        status
                        fileUrl
                    }
                }
            `;
        
            try {
                const data = await fetchGraphQL(query, { id: taskId });
                console.log('Datos recibidos:', data);
        
                const task = data.getTask;
        
                if (task) {
                    document.getElementById('editTaskName').value = task.name;
                    document.getElementById('editTaskDescription').value = task.description;
                    document.getElementById('editTaskDate').value = task.date ? task.date.split('T')[0] : ''; // Convertir ISO a formato "YYYY-MM-DD"
                    document.getElementById('editTaskResponsible').value = task.responsible;
                    document.getElementById('editTaskStatus').value = task.status;
        
                    // Manejar el enlace del archivo existente
                    const currentFileLink = document.getElementById('currentFileLink');
                    if (task.fileUrl) {
                        currentFileLink.style.display = 'inline';
                        currentFileLink.href = task.fileUrl;
                        currentFileLink.textContent = 'Descargar archivo actual';
                    } else {
                        currentFileLink.style.display = 'none';
                    }
        
                    editingTaskId = task.id; // Guardar el ID de la tarea
                    $('#editTaskModal').modal('show'); // Mostrar el modal
                } else {
                    console.error('La tarea no se encontró');
                }
            } catch (error) {
                console.error('Error al obtener la tarea:', error);
            }
        };
        
        // Función para actualizar la tarea
        const updateTask = async (event) => {
            event.preventDefault(); 
        
            // Obtener los datos del formulario
            const taskName = document.getElementById('editTaskName').value.trim();
            const taskDescription = document.getElementById('editTaskDescription').value.trim();
            const taskDate = document.getElementById('editTaskDate').value;
            const taskResponsible = document.getElementById('editTaskResponsible').value.trim();
            const taskStatus = document.getElementById('editTaskStatus').value;
            const taskFile = document.getElementById('taskFile').files[0];
        
            if (!taskName || !taskDescription || !taskDate || !taskResponsible || !taskStatus) {
                alert("Por favor, complete todos los campos obligatorios.");
                return;
            }
        
            let fileUrl = null;
        
            if (taskFile) {
                const formData = new FormData();
                formData.append('taskFile', taskFile);
        
                try {
                    const fileUploadResponse = await fetch('http://localhost:4000/upload', {
                        method: 'POST',
                        body: formData,
                    });
        
                    const fileUploadResult = await fileUploadResponse.json();
        
                    if (fileUploadResult.error) {
                        console.error("Error al cargar el archivo:", fileUploadResult.error);
                        alert("Error al cargar el archivo.");
                        return;
                    }
        
                    fileUrl = fileUploadResult.fileUrl || null;
                } catch (error) {
                    console.error("Error al subir el archivo:", error);
                    alert("Error al procesar la carga del archivo.");
                    return;
                }
            }
        
            try {
                const updateResponse = await fetch('http://localhost:4000/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                            mutation UpdateTask($id: ID!, $name: String!, $description: String!, $date: String!, $responsible: String!, $status: String!, $fileUrl: String) {
                                updateTask(id: $id, name: $name, description: $description, date: $date, responsible: $responsible, status: $status, fileUrl: $fileUrl) {
                                    id
                                    name
                                    description
                                    date
                                    responsible
                                    status
                                    fileUrl
                                }
                            }
                        `,
                        variables: {
                            id: editingTaskId, 
                            name: taskName,
                            description: taskDescription,
                            date: taskDate,
                            responsible: taskResponsible,
                            status: taskStatus,
                            fileUrl: fileUrl,
                        }
                    })
                });
        
                const result = await updateResponse.json();
        
                if (result.errors) {
                    console.error("Error al actualizar tarea:", result.errors);
                    alert("Hubo un problema al actualizar la tarea.");
                } else {
                    const updatedTask = result.data.updateTask;
                    alert("Tarea actualizada exitosamente!");
                    $('#editTaskModal').modal('hide');
                    
                    // Emitir el evento de WebSocket para notificar a otros clientes
                    socket.emit('editTask', updatedTask);
                }
            } catch (error) {
                console.error("Error al procesar la solicitud:", error);
                alert("Error al procesar la solicitud.");
            }
        };

    // Agregar el listener al formulario de edición
    document.getElementById('editTaskForm').addEventListener('submit', updateTask);



        // Funcion crear Tarea
        const createTask = async (event) => {
            event.preventDefault(); 
        
            // Validación de los datos
            if (!selectedPanelId) {
                alert("Por favor, selecciona un panel antes de crear una tarea.");
                return;
            }
        
            const taskName = document.getElementById('taskName').value.trim();
            const taskDescription = document.getElementById('taskDescription').value.trim();
            const taskDate = document.getElementById('taskDate').value;
            const taskResponsible = document.getElementById('taskResponsible').value.trim();
            const taskStatus = document.getElementById('taskStatus').value;
            const taskFile = document.getElementById('taskFile').files[0];
        
            // Validar los datos antes de continuar
            if (!taskName || !taskDescription || !taskDate || !taskResponsible || !taskStatus) {
                alert("Por favor, complete todos los campos obligatorios.");
                return;
            }
        
            let fileUrl = null;
        
            // Si se selecciona un archivo, se sube
            if (taskFile) {
                const formData = new FormData();
                formData.append('taskFile', taskFile);
        
                try {
                    const fileUploadResponse = await fetch('http://localhost:4000/upload', {
                        method: 'POST',
                        body: formData,
                    });
        
                    const fileUploadResult = await fileUploadResponse.json();
        
                    if (fileUploadResult.error) {
                        console.error("Error al cargar el archivo:", fileUploadResult.error);
                        alert("Error al cargar el archivo.");
                        return;
                    }
        
                    fileUrl = fileUploadResult.fileUrl || null;
                } catch (error) {
                    console.error("Error al subir el archivo:", error);
                    alert("Error al procesar la carga del archivo.");
                    return;
                }
            }
        
            // Crear la tarea en el servidor
            try {
                const taskMutationResponse = await fetch('http://localhost:4000/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                            mutation CreateTask($name: String!, $description: String!, $date: String!, $responsible: String!, $status: String!, $fileUrl: String, $panelId: ID!) {
                                createTask(name: $name, description: $description, date: $date, responsible: $responsible, status: $status, fileUrl: $fileUrl, panelId: $panelId) {
                                    id
                                    name
                                    description
                                    date
                                    responsible
                                    status
                                    fileUrl
                                }
                            }
                        `,
                        variables: {
                            name: taskName,
                            description: taskDescription,
                            date: taskDate,
                            responsible: taskResponsible,
                            status: taskStatus,
                            fileUrl: fileUrl,
                            panelId: selectedPanelId,
                        }
                    })
                });
        
                const result = await taskMutationResponse.json();
        
                if (result.errors) {
                    console.error("Error al crear tarea:", result.errors);
                    alert("Hubo un error al crear la tarea.");
                } else {
                    const newTask = result.data.createTask;
                    alert("Tarea creada exitosamente!");
                    $('#createTaskModal').modal('hide');
        
                    // Emitir el evento de WebSocket para notificar a otros clientes
                    socket.emit('createTask', newTask);
                }
            } catch (error) {
                console.error("Error al enviar la solicitud:", error);
                alert("Error al procesar la solicitud.");
            }
        };

        // Agregar el listener al formulario
        document.getElementById('createTaskForm').addEventListener('submit', createTask);


        // Eliminar una tarea
        const deleteTask = async (taskId) => {
            if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
                const mutation = `
                    mutation DeleteTask($id: ID!) {
                        deleteTask(id: $id)
                    }
                `;
        
                try {
                    const result = await fetchGraphQL(mutation, { id: taskId });
        
                    if (result.errors && result.errors.length > 0) {
                        console.error('Error al eliminar la tarea:', result.errors);
                        alert("No se pudo eliminar la tarea.");
                    } else {
                        alert('Tarea eliminada');
                        // Emitir evento de WebSocket
                        socket.emit('deleteTask', taskId);
                    }
                } catch (error) {
                    console.error('Error al realizar la mutación de eliminación:', error);
                    alert("Error al eliminar la tarea.");
                }
            }
        };
        

// Llamada inicial para cargar los paneles cuando se carga la página
loadPanels();
