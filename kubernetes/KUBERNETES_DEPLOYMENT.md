# Local Kubernetes deployment

This guide uses Minikube and Docker Desktop. No AWS account, ECR repository, or
cloud load balancer is required. The NGINX Ingress routes `/` to the React app
and `/api` to the Node.js backend.

## 1. Prerequisites

Install Docker Desktop, Minikube, and `kubectl`. Start Docker Desktop first.
Run all commands below in PowerShell from the repository root.

## 2. Start Kubernetes

```powershell
minikube start --driver=docker
minikube addons enable ingress
kubectl get nodes
```

## 3. Build images inside Minikube

These commands make the images available to Kubernetes without uploading them
to Docker Hub or any cloud registry.

```powershell
minikube image build -t ai-resume-frontend:latest .\client
minikube image build -t ai-resume-backend:latest .\server
minikube image ls | Select-String "ai-resume"
```

## 4. Create secrets

Create `server/.env` locally with these keys: `MONGODB_URI`, `JWT_SECRET`,
`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`, and
`IMAGEKIT_PRIVATE_KEY`. Keep this file private; do not commit it.

```powershell
kubectl apply -f .\kubernetes\namespace.yml

kubectl create secret generic app-secrets `
  --namespace resume-app `
  --from-env-file=.\server\.env `
  --dry-run=client -o yaml | kubectl apply -f -
```

Do not apply `mongo-secret.yml`; it is a placeholder only.

## 5. Deploy the app

```powershell
kubectl apply -f .\kubernetes\backend-deployment.yml
kubectl apply -f .\kubernetes\backend-service.yml
kubectl apply -f .\kubernetes\frontend-deployment.yml
kubectl apply -f .\kubernetes\frontend-service.yml
kubectl apply -f .\kubernetes\ingress.yml

kubectl rollout status deployment/backend -n resume-app
kubectl rollout status deployment/frontend -n resume-app
kubectl get pods,services,ingress -n resume-app
```

## 6. Open the app

Keep this command running and open the URL it displays in your browser:

```powershell
minikube tunnel
```

Then open `http://localhost`. If port 80 is busy, use this alternative in a
second PowerShell window:

```powershell
kubectl port-forward service/ingress-nginx-controller 8080:80 -n ingress-nginx
```

Open `http://localhost:8080`.

## Check errors and update

```powershell
kubectl get pods -n resume-app
kubectl logs deployment/backend -n resume-app
kubectl describe ingress resume-app -n resume-app
```

After changing code, rebuild the changed image and restart its deployment:

```powershell
minikube image build -t ai-resume-frontend:latest .\client
minikube image build -t ai-resume-backend:latest .\server
kubectl rollout restart deployment/frontend deployment/backend -n resume-app
```

## Delete the local deployment

```powershell
kubectl delete namespace resume-app
minikube stop
```
