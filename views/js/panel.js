// Función para hacer la solicitud a la API GraphQL
const fetchGraphQL = async (query, variables = {}) => {
    const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    console.log('Respuesta de GraphQL:', result);

    if (result.errors) {
        console.error('Errores de GraphQL:', result.errors);
    }
    return result.data;
};


// Crear un panel con GraphQL
document.getElementById('createPanelForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('panelTitle').value;
    const description = document.getElementById('panelDescription').value;
    const proceso = document.getElementById('proceso').value;

    // Definir la consulta de GraphQL para crear un panel
    const query = `
        mutation CreatePanel($name: String!, $description: String!, $proceso: String!) {
            createPanel(name: $name, description: $description, proceso: $proceso) {
                id
                name
                description
                proceso
            }
        }
    `;

    const variables = {
        name: title,
        description: description,
        proceso: proceso,
    };

    try {
        const data = await fetchGraphQL(query, variables);
        console.log('Panel creado:', data.createPanel);
        
        // Mostrar mensaje de éxito
        document.getElementById('message').classList.remove('d-none');
        setTimeout(() => {
            document.getElementById('message').classList.add('d-none');
        }, 1500);
        
        // Recargar los paneles después de crear uno
        loadPanels();
    } catch (error) {
        console.error('Error al crear el panel:', error);
        alert('Hubo un error al crear el panel');
    }
});

// Cargar los Paneles desde la base de datos
const loadPanels = async () => {
    const query = `
        query GetPanels {
            getPanels {
                id
                name
                description
                proceso
            }
        }
    `;

    try {
        const data = await fetchGraphQL(query);
        const panelList = document.getElementById('panelList');
        panelList.innerHTML = '';

        if (data && data.getPanels) {
            data.getPanels.forEach(panel => {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.setAttribute('id', `panel-${panel.id}`);  // ID único para cada panel
                li.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>${panel.name}</strong><br>
                            <small>${panel.description}</small><br>
                            <small><strong>Proceso:</strong> ${panel.proceso}</small>
                        </div>
                        <div>
                            <button class="btn btn-warning btn-sm mr-2" onclick="editPanel('${panel.id}')">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deletePanel('${panel.id}')">Eliminar</button>
                        </div>
                    </div>
                `;
                panelList.appendChild(li);
            });
        } else {
            panelList.innerHTML = '<li class="list-group-item">No se encontraron paneles.</li>';
        }
    } catch (error) {
        console.error('Error al cargar los paneles:', error);
    }
};

// Función para eliminar un panel
const deletePanel = async (panelId) => {
    const query = `
        mutation DeletePanel($id: ID!) {
            deletePanel(id: $id)
        }
    `;

    const variables = { id: panelId };

    try {
        const data = await fetchGraphQL(query, variables);
        console.log('Panel eliminado:', data.deletePanel);

        // Recargar los paneles después de eliminar uno
        loadPanels();
    } catch (error) {
        console.error('Error al eliminar el panel:', error);
    }
};

// Variable global para guardar el ID del panel que se está editando
let currentPanelId = null;

// Función para mostrar los datos del panel en el modal de edición
const editPanel = (panelId) => {
    currentPanelId = panelId;

    const panel = document.getElementById(`panel-${panelId}`);
    const panelTitle = panel.querySelector('strong').innerText;
    const panelDescription = panel.querySelector('small').innerText.split('Descripción: ')[1];  // Extraer la descripción
    const panelProceso = panel.querySelector('small').innerText.split('Proceso: ')[1];  // Extraer el proceso

    document.getElementById('editPanelTitle').value = panelTitle;
    document.getElementById('editPanelDescription').value = panelDescription;
    document.getElementById('editProceso').value = panelProceso;

    // Mostrar el modal
    $('#editModal').modal('show');
};

// Función para actualizar un panel
const updatePanel = async () => {
    const name = document.getElementById('editPanelTitle').value;
    const description = document.getElementById('editPanelDescription').value;
    const proceso = document.getElementById('editProceso').value;

    const query = `
        mutation UpdatePanel($id: ID!, $name: String!, $description: String!, $proceso: String!) {
            updatePanel(id: $id, name: $name, description: $description, proceso: $proceso) {
                id
                name
                description
                proceso
            }
        }
    `;

    const variables = { id: currentPanelId, name, description, proceso };

    try {
        const data = await fetchGraphQL(query, variables);
        console.log('Panel actualizado:', data.updatePanel);

        // Cerrar el modal y recargar los paneles
        $('#editModal').modal('hide');
        loadPanels();
    } catch (error) {
        console.error('Error al actualizar el panel:', error);
        alert('Hubo un error al actualizar el panel');
    }
};

// Cargar paneles cuando la página se carga
loadPanels();