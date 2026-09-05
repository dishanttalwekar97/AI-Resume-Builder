# Step-by-Step AWS EC2 Deployment Guide

This guide will walk you through deploying your **React Frontend** and **Node.js Backend** application to an **AWS EC2 instance** using **Docker and Docker Compose**.

---

## 📋 Overview of Architecture

```
[ User Browser ]
       │
       │ HTTP (Port 80) / HTTPS (Port 443)
       ▼
 ┌────────────────────────────────────────────────────────┐
 │ AWS EC2 Instance (Ubuntu 22.04 / 24.04 LTS)            │
 │                                                        │
 │  ┌──────────────────────┐    ┌──────────────────────┐  │
 │  │ Frontend Container   │    │ Backend Container    │  │
 │  │ (Nginx + React App)  │───►│ (Node.js API)        │  │
 │  │ Port 80              │/api│ Port 3000            │  │
 │  └──────────────────────┘    └──────────┬───────────┘  │
 └─────────────────────────────────────────┼──────────────┘
                                           │
                                           ▼
                                 [ MongoDB Atlas Cloud ]
```

---

## Step 1: Prepare Database (MongoDB Atlas)

Ensure your Node.js backend connects to a cloud-accessible MongoDB instance:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Create a Free Cluster (M0).
3. Under **Network Access**, click **Add IP Address** and add `0.0.0.0/0` (Allow access from anywhere).
4. Under **Database Access**, create a database user and copy the connection string:
   `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/resume-db?retryWrites=true&w=majority`

---

## Step 2: Create a `docker-compose.yml` in Your Project Root

Create a `docker-compose.yml` file in the root folder of your project (`React Project/docker-compose.yml`):

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: resume-backend
    restart: always
    env_file:
      - ./server/.env
    ports:
      - "3000:3000"
    networks:
      - app-network

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
      args:
        - VITE_BASE_URL=/api
    container_name: resume-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

---

## Step 3: Configure Frontend Nginx to Proxy `/api` to Backend

In `client/nginx.conf`, make sure `/api` requests are proxied to the backend:

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Proxy API requests to backend container
  location /api/ {
    proxy_pass http://backend:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## Step 4: Launch an AWS EC2 Instance

1. Log into your [AWS Management Console](https://aws.amazon.com/console/).
2. Search for **EC2** and click **Launch Instance**.
3. **Name**: `resume-app-server`
4. **OS Image (AMI)**: Choose **Ubuntu 24.04 LTS** or **Ubuntu 22.04 LTS** (Free Tier eligible).
5. **Instance Type**: Select `t2.micro` or `t3.micro` (1 vCPU, 1 GiB RAM - Free Tier eligible).
6. **Key Pair**:
   - Click **Create new key pair**.
   - Name: `resume-app-key`
   - Key pair type: `RSA`, Private key file format: `.pem`.
   - Click **Create key pair** (Save this file to your computer; e.g., `Downloads` or `~/.ssh/`).
7. **Network Settings (Security Group)**:
   - Allow SSH traffic from **Anywhere** (`0.0.0.0/0`) or **My IP**.
   - Check **Allow HTTP traffic from the internet** (Port 80).
   - Check **Allow HTTPS traffic from the internet** (Port 443).
8. **Storage**: Keep default 8 GB GP3.
9. Click **Launch Instance**.

---

## Step 5: Connect to Your EC2 Instance via SSH

1. Open PowerShell or Terminal on your computer.
2. Set permissions on your key file (if on Linux/macOS run `chmod 400 resume-app-key.pem`).
3. Locate the **Public IPv4 Address** of your instance from the AWS EC2 Console (e.g. `54.210.12.34`).
4. Run the SSH command:

```bash
ssh -i "path/to/resume-app-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## Step 6: Install Docker & Docker Compose on EC2

Once connected inside the EC2 SSH terminal, run the following commands to install Docker:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
sudo apt install -y docker.io docker-compose-v2

# 3. Enable Docker to start on boot & start service
sudo systemctl enable docker
sudo systemctl start docker

# 4. Allow ubuntu user to run Docker without sudo
sudo usermod -aG docker ubuntu

# 5. Apply the group change (or re-login)
newgrp docker

# 6. Verify Docker installation
docker --version
docker compose version
```

---

## Step 7: Push Your Code to GitHub & Clone on EC2

1. Push your latest project code (including `docker-compose.yml`) to a GitHub repository.
2. Inside your EC2 SSH session, clone your repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.NET.git app
cd app
```

---

## Step 8: Create the `.env` File on EC2

Create `server/.env` inside your cloned project directory:

```bash
nano server/.env
```

Paste your environment variables:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/resume-db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

Press `Ctrl + O`, `Enter` to save, and `Ctrl + X` to exit `nano`.

---

## Step 9: Build & Run Containers with Docker Compose

Now build and start your containers in detached mode:

```bash
docker compose up -d --build
```

To view running containers:
```bash
docker compose ps
```

To view logs:
```bash
docker compose logs -f
```

---

## Step 10: Test Your Live App!

Open your browser and navigate to:
`http://<YOUR_EC2_PUBLIC_IP>`

Your React frontend will load, and API calls to `/api/...` will automatically route to your Node.js backend container!

---

## 🎯 Bonus Step: Adding a Custom Domain & SSL (HTTPS)

If you own a domain (e.g. `myresumeapp.com`):
1. In Cloudflare / Namecheap / Route 53, add an **A Record**:
   - `Name`: `@` (or `app`)
   - `Value`: `<YOUR_EC2_PUBLIC_IP>`
2. Install Certbot on EC2 for free HTTPS certificates:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 🛠️ Handy Commands for Maintenance

- **Restart app**: `docker compose restart`
- **Rebuild after code changes**: `git pull && docker compose up -d --build`
- **Stop containers**: `docker compose down`
- **Check server logs**: `docker compose logs -f backend`
