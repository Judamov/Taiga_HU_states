# Taiga HU States

Este proyecto permite consultar información de Sprints y User Stories desde la API de Taiga, generando archivos de salida que registran datos relevantes del proyecto. Está desarrollado en **TypeScript** y utiliza solicitudes HTTPS para interactuar con la API.

## Instalación

Clona el repositorio y, dentro de la carpeta del proyecto, instala las dependencias usando **yarn** o **npm**:

```bash
# Clona el repositorio
git clone https://github.com/Judamov/Taiga_HU_states.git
cd Taiga_HU_states

# Instala las dependencias con yarn
yarn install

# O alternativamente, con npm
npm install
```
## Recomendacion
El certificado SSL del servidor Taiga está vencido.

es imporante correr el siguiente comando 
```bash
export NODE_TLS_REJECT_UNAUTHORIZED="0"
```
