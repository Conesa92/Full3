const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const http = require("http");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const socketIo = require("socket.io");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const connectToDatabase = require("./config/database");
require("dotenv").config();

// Inicializar Express y HTTP Server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 4000;

// Configuración de Multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Directorio donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);  // Generar un sufijo único
    const fileExtension = path.extname(file.originalname);  // Obtener la extensión del archivo
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);  // Nombre único
  },
});

// Crear el middleware de multer
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Limitar el tamaño de los archivos a 10MB
  fileFilter: (req, file, cb) => {
    // Si no hay archivo, no procesar el filtro
    if (!file) {
      return cb(null, true); // No hay archivo, permitimos el paso
    }

    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt'];  // Tipos de archivo permitidos
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);  // Si el archivo es válido, continua
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);  // Si el archivo no es válido, rechazar
    }
  }
});

// Sirve los archivos desde el directorio 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());

// Configurar ruta para servir el archivo HTML
app.use(express.static(path.join(__dirname, "views"))); 

// Inicializar Apollo Server
const startApolloServer = async () => {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start(); // Es necesario en Apollo Server v3+
  apolloServer.applyMiddleware({ app });
  console.log(`GraphQL en http://localhost:${port}${apolloServer.graphqlPath}`);
};

// Configurar rutas adicionales, como la carga de archivos
app.post('/upload', upload.single('taskFile'), (req, res) => {
  // Si el archivo se cargó correctamente, devolver la URL del archivo
  if (req.file) {
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ fileUrl });
  } else {
    res.status(400).json({ error: 'No se ha subido ningún archivo.' });
  }
});

// Conectar a la base de datos y arrancar el servidor
connectToDatabase()
  .then(() => {
    console.log("Conectado a la base de datos");
    startApolloServer().then(() => {
      server.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
      });
    });
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });
