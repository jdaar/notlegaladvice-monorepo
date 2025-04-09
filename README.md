> build image - execute from project root
> podman build -t notlegaladvice-server:latest -f deployment/Dockerfile

> create k8s resources
> kind load docker-image localhost/notlegaladvice-server:latest
> kubectl apply -f deployment/cluster/...

