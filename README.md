# Estructura de carpetas

- /apps = Todo lo relacionado a entrypoints de los paquetes del workspace @notlegaladvice
  - /apps/frontend = Frontend React Native **(AQUI SE ENCUENTRA EL CONTENIDO PRINCIPAL DE LA ENTREGA 1, TODO LO DEMAS ES PRINCIPALMENTE DE BACKEND)**
  - /apps/server = Backend Fastify
- /packages = Todo lo relacionado a dominio e integraciones
  - /packages/application = Capa de aplicacion (ubicacion del mecanismo de IoC)
  - /packages/data = Esquemas de datos y tipado relacionado a aspectos tecnicos o sistemas propios de la aplicacion
  - /packages/database = Integracion con base de datos (MongoDB)
  - /packages/file-repository = Integracion con base de datos orientada a adquisicion de datos binarios, en el futuro sera migrado a un almacenamiento de objetos (actualmente MongoDB, en un futuro posiblemente S3)
  - /packages/llm-integration = Integracion con LLM y LangChain
  - /packages/streaming = Abstraccion de streaming para gestion reactiva de los datos
  - /packages/usecase = Casos de uso de la aplicacion
  - /packages/domain = Dominio de la aplicacion

# Ejecucion en local

Se recomienda el uso de Nix como gestor de paquetes pues se cuenta con un flake que incluye las versiones esperadas del software y contiene un devShell completo con definicion de variables de entorno que son requeridas para la ejecucion del backend

## Ejecucion del backend

### Instrucciones de ejecucion

En progreso.

### Despliegue en K8s

> Crear imagen (ejecutar desde el root del projecto de Git)

> podman build -t notlegaladvice-server:latest -f deployment/Dockerfile

> Crear recursos de K8s

> kind load docker-image localhost/notlegaladvice-server:latest

> kubectl apply -f deployment/cluster/...

## Ejecucion del frontend

### Instrucciones de ejecucion

> Instalar dependencias (Opcional si ya se cuenta con Node 20.x y Corepack 20.x)
> `nix develop`

> Instalar dependencias de Node
> `npm install`

> Ejecutar la aplicacion (Para plataforma web)
> `npx nx run @notlegaladvice/frontend:serve`

Habiendo hecho esto el frontend deberia estar disponible en http://localhost:8081

### Stack tecnologico

- Libreria UI: React Native
- Libreria para funcionalidades nativas: Expo
- Libreria para manejo de estado global: Zustand
