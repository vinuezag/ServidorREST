const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Listas para almacenar los objetos JSON recibidos
let lista = [];
let entregados = [];  // Lista de registros entregados

// Método all para manejar todas las solicitudes y registrar el acceso
app.all('*', (req, res, next) => {
    console.log(Método: ${req.method}, Ruta: ${req.path});

    // Lógica para la ruta GET /buscar-registro
    if (req.method === 'GET' && req.path === '/buscar-registro') {
        const { cedula } = req.query;
        const registroEncontrado = lista.find(item => item.cedula === cedula);
        
        if (registroEncontrado) {
            return res.status(200).json(registroEncontrado);
        } else {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }
    }

    // Lógica para la ruta DELETE /eliminar-json
    if (req.method === 'DELETE' && req.path === '/eliminar-json') {
        const { cedula } = req.query;
        const index = lista.findIndex(item => item.cedula === cedula);
        
        if (index === -1) {
            return res.status(404).json({ mensaje: 'Registro no encontrado para eliminar' });
        }

        const [entregado] = lista.splice(index, 1);
        entregados.push(entregado);

        return res.json({
            mensaje: 'Registro eliminado y registrado en la lista de entregados',
            entregado,
            listaPendiente: lista,
            listaEntregados: entregados,
        });
    }

    // Lógica para la ruta PUT /actualizar-correo
    if (req.method === 'PUT' && req.path === '/actualizar-correo') {
        const { cedula } = req.query;
        const { correo } = req.body;
        const registroEncontrado = lista.find(registro => registro.cedula === cedula);
        
        if (registroEncontrado) {
            registroEncontrado.correo = correo;
            return res.status(200).json({ mensaje: 'Correo actualizado con éxito', registro: registroEncontrado });
        } else {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }
    }

    // Validación de JSON solo si el método es POST
    if (req.method === 'POST' && req.is('application/json')) {
        const json = req.body;
        const camposPermitidos = ['cedula', 'nombre', 'correo', 'boletos', 'zona'];
        
        // Verificación de campos inválidos
        const camposRecibidos = Object.keys(json);
        const camposInvalidos = camposRecibidos.filter(campo => !camposPermitidos.includes(campo));
        
        if (camposInvalidos.length > 0) {
            return res.status(400).json({ mensaje: 'Campos inválidos en el JSON', camposInvalidos });
        }

        // Validación de los campos del JSON
        const validaciones = [
            { campo: 'cedula', validacion: json.cedula && typeof json.cedula === 'string' && /^\d{10}$/.test(json.cedula), mensaje: 'El campo "cedula" debe tener exactamente 10 dígitos numéricos' },
            { campo: 'nombre', validacion: json.nombre && typeof json.nombre === 'string' && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(json.nombre), mensaje: 'El campo "nombre" debe ser una cadena de texto que contenga solo letras, acentos y espacios' },
            { campo: 'correo', validacion: json.correo && typeof json.correo === 'string' && /\S+@\S+\.\S+/.test(json.correo), mensaje: 'El campo "correo" debe ser una dirección de correo válida' },
            { campo: 'boletos', validacion: json.boletos && typeof json.boletos === 'number', mensaje: 'El campo "boletos" debe ser un número' },
            { campo: 'zona', validacion: json.zona && typeof json.zona === 'string', mensaje: 'El campo "zona" debe ser una cadena de texto' },
        ];

        for (let validacion of validaciones) {
            if (!validacion.validacion) {
                return res.status(400).json({ mensaje: validacion.mensaje });
            }
        }

        // Verificar si la cédula ya está registrada
        const cedulaExistente = lista.find(item => item.cedula === json.cedula);
        if (cedulaExistente) {
            return res.status(400).json({ mensaje: 'La cédula ya está registrada' });
        }
    }

    next();
});

// Ruta para manejar el POST y guardar el JSON en la lista
app.post('/guardar-json', (req, res) => {
    const json = req.body;

    // Validar que el cuerpo recibido es un objeto JSON
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
        return res.status(400).json({ mensaje: 'El dato enviado no es un JSON válido' });
    }

    lista.push(json); // Guardar el JSON en la lista
    res.status(200).json({ mensaje: 'JSON guardado exitosamente', lista });
});

// Servidor escuchando en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});