# Ejecucion en local

Se recomienda el uso de Nix como gestor de paquetes pues se cuenta con un flake que incluye las versiones esperadas del software y contiene un devShell completo con definicion de variables de entorno que son requeridas para la ejecucion del backend

## Ejecucion del backend

En progreso.

### Despliegue en K8s

> Crear imagen (ejecutar desde el root del projecto de Git)
> podman build -t notlegaladvice-server:latest -f deployment/Dockerfile

> Crear recursos de K8s
> kind load docker-image localhost/notlegaladvice-server:latest
> kubectl apply -f deployment/cluster/...

## Ejecucion del frontend

> Instalar dependencias (Opcional si ya se cuenta con Node 20.x y Corepack 20.x)
> `nix develop`

> Instalar dependencias de Node
> `npm install`

> Ejecutar la aplicacion (Para plataforma web)
> `npx nx run @notlegaladvice/frontend:serve`

Habiendo hecho esto el frontend deberia estar disponible en http://localhost:8081
