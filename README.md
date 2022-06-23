# MiniWhatsApp

![MiniWhatsApp preview](https://res.cloudinary.com/dzs8lf9lc/image/upload/v1655957791/mini-whatsapp/Screenshot_2022-06-22_221555_fc342y.png)

**MiniWhatsApp** es un pequeño clon de la aplicación de mensajeria WhatsApp. Se hizo con el fin de mejorar
mis habilidades y conocimientos con el stack de tecnologías MERN (MongoDB, Express, React, Node) basado en Typescript además de aumentar mi comprensión de otras como Socket.io y Redux Toolkit.

&nbsp;

Trae muchas de las funcionalidades del WhatsApp original, tales como: registrar usuarios, configuración de privacidad y prefil,
chatear con usuarios y contactos, envio de imagenes y gifs, reenvio de mensajes, busqueda de chats, eliminación de mensajes, bloqueo de usuarios, creación de grupos, asignación de administradores, agregar nuevos usuarios a un grupo. etc. Si desea probar la aplicación haga click [aquí](https://mini-whatsapp.vercel.app)

&nbsp;

## Instrucciones de uso

### 1) Entorno de desarrollo
Antes de comenzar debes asegurarte de tener Node.js instalado en tu equipo, si no lo tienes aquí te dejo la documentación oficial: 
[Click para ir](https://nodejs.org)

&nbsp;

### 2) Variables de entorno
Para este proyecto debes definir las siguientes variables de entorno, tanto en backend como frontend.

En mini-whatsapp-backend crea un archivo .env con las siguientes variables:

```env
BACKGROUND_GRAY_URL= url del fondo gris almacenado en cloudinary
BACKGROUND_GREEN_URL= url del fondo verde almacenado en cloudinary
CLIENT_URL= url del frontend
CLOUDINARY_API_KEY= key de cloudinary
CLOUDINARY_API_SECRET= api secret de cloudinary
CLOUDINARY_CLOUD_NAME= nombre de nube de cloudinary
CLOUDINARY_FOLDER_BACKGROUNDS= carpeta donde se guardaran los fondos en cloudinary
CLOUDINARY_FOLDER_CHATS= carpeta donde se guardaran las imagenes mandadas a los chats en cloudinary 
CLOUDINARY_FOLDER_GROUPS= carpeta para las fotos de grupos que se guardaran en cloudinary
CLOUDINARY_FOLDER_USERS= carpeta para las fotos de los usuarios que se guardaran en cloudinary
MONGODB_CNN= conexión a base de datos de mongo db
PORT= puerto en que corre el backend
SECRET_PRIVATE_KEY= clave secreta para generar tokens
```

&nbsp;


En mini-whatsapp-frontend crea un archivo .env.local con las siguientes variables:
```
REACT_APP_API_URL= url del backend
REACT_APP_GIPHY_API_KEY= api key de giphy
```

Hay ciertas cosas que vas a requerir como tener una cuenta en cloudinary y en giphy,
en el caso de la base de datos puedes usar una local una de MongoAtlas, te dejo los 3 links para ello, con
los datos que te den ponlos de valor en las variables.

[Cloudinary](https://cloudinary.com)

[Giphy](https://giphy.com)

[MongoAtlas](https://www.mongodb.com/atlas/database)

&nbsp;

### 3) Instalación de dependencias
Ahora lo siguiente que debes hacer es abir una terminal, cmd o powershell, moverte a la carpeta de mini-whatsapp-backend y ejecutar
el siguiente comando:

```npm
npm install
```

Luego, muevete a la carpeta mini-whatsapp-frontend y ejecuta el mismo comando.

&nbsp;

### 4) Arrancar proyecto
Por último lo que debes hacer es moverte nuevamente a mini-whatsapp-backend y levantar la api con el siguient comando:

```npm
npm run dev
```

&nbsp;


Luego, vas a moverte a mini-whatsapp-frontend y ejecutar:

```npm
npm start
```

Y listo, solo abre en un navegador ```http://localhost:3000``` y ya lo tienes funcionando.