const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Lista para almacenar los objetos JSON recibidos
let lista = [];
let entregados = [];  // Esta es la lista global para los entregados

// Método all para manejar todas las solicitudes y registrar el acceso
app.all('*', (req, res, next) => {
    // Validación del JSON solo si el método es POST
    if (['POST'].includes(req.method) && req.is('application/json')) {
        const json = req.body;

        // Definir los campos permitidos
        const camposPermitidos = ['cedula', 'nombre', 'correo', 'boletos', 'zona'];

        // Verificar que solo estén presentes los campos permitidos
        const camposRecibidos = Object.keys(json);
        const camposInvalidos = camposRecibidos.filter(campo => !camposPermitidos.includes(campo));

        if (camposInvalidos.length > 0) {
            return res.status(400).json({ mensaje: 'Campos inválidos en el JSON', camposInvalidos });
        }

        // Validación de los campos del JSON
        if (!json.cedula || typeof json.cedula !== 'string') {
            return res.status(400).json({ mensaje: 'El campo "cedula" es obligatorio y debe ser una cadena de texto' });
        }

        if (!json.nombre || typeof json.nombre !== 'string') {
            return res.status(400).json({ mensaje: 'El campo "nombre" es obligatorio y debe ser una cadena de texto' });
        }

        if (!json.correo || typeof json.correo !== 'string' || !/\S+@\S+\.\S+/.test(json.correo)) {
            return res.status(400).json({ mensaje: 'El campo "correo" es obligatorio y debe ser una dirección de correo válida' });
        }

        if (!json.boletos || typeof json.boletos !== 'number') {
            return res.status(400).json({ mensaje: 'El campo "boletos" es obligatorio y debe ser un número' });
        }

        if (!json.zona || typeof json.zona !== 'string') {
            return res.status(400).json({ mensaje: 'El campo "zona" es obligatorio y debe ser una cadena de texto' });
        }
    }

    console.log(`Método: ${req.method}, Ruta: ${req.path}`);
    next();
});

// Ruta para manejar el POST y guardar el JSON en la lista
app.post('/guardar-json', (req, res) => {
    const json = req.body; // Extraer el JSON completo del cuerpo de la solicitud

    // Validar que el cuerpo recibido es un objeto JSON
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
        return res.status(400).json({ mensaje: 'El dato enviado no es un JSON válido' });
    }

    lista.push(json); // Guardar el JSON en la lista
    res.status(200).json({ mensaje: 'JSON guardado exitosamente', lista });
});

// Ruta para buscar un registro por cédula
app.get('/buscar-registro/:cedula', (req, res) => {
    const cedula = req.params.cedula;
    const registroEncontrado = lista.find(registro => registro.cedula === cedula);

    if (registroEncontrado) {
        res.status(200).json(registroEncontrado);
    } else {
        res.status(404).json({ mensaje: 'Registro no encontrado' });
    }
});

// Ruta para actualizar el correo de un registro por cédula
app.put('/actualizar-correo/:cedula', (req, res) => {
    const cedula = req.params.cedula;
    const nuevoCorreo = req.body.correo;

    // Buscar el registro correspondiente
    const registroEncontrado = lista.find(registro => registro.cedula === cedula);

    if (registroEncontrado) {
        // Actualizar el correo electrónico
        registroEncontrado.correo = nuevoCorreo;
        res.status(200).json({ mensaje: 'Correo actualizado con éxito', registro: registroEncontrado });
    } else {
        res.status(404).json({ mensaje: 'Registro no encontrado' });
    }
});

// Ruta para eliminar un JSON y moverlo a la lista de entregados
app.delete('/eliminar-json/:cedula', (req, res) => {
    const { cedula } = req.params;  // Obtenemos la cedula de los parámetros de la URL

    // Buscar el JSON por la cedula
    const index = lista.findIndex(item => item.cedula === cedula);

    if (index === -1) {
        return res.status(404).json({ mensaje: 'Registro no encontrado para eliminar' });
    }

    // Mover el JSON a la lista de entregados
    const [entregado] = lista.splice(index, 1);  // Eliminar el registro de la lista

    // Añadir a la lista de entregados
    entregados.push(entregado);

    res.json({
        mensaje: 'Registro eliminado y registrado en la lista de entregados',
        entregado,
        listaPendiente: lista,
        listaEntregados: entregados,
    });
});

// Servidor escuchando en el puerto 3000
app.listen(3000, () => {
    console.log('La solicitud fue realizada por el puerto 3000'); // Notificación del inicio del servidor
});
