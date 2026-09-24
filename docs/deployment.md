# Deployment & Self-Hosting Guide

PFIS can be self-hosted on any standard Linux VPS, cloud compute instance, or container platform.

---

## 1. Containerized Deployment (Docker Compose)

The repository provides a production-ready `docker-compose.yml` supporting:
- Express.js API backend
- React frontend (served via Nginx)
- PostgreSQL relational database
- *(Optional)* MinIO S3 object store
- *(Optional)* Ollama container

### Quick Launch
```bash
# Clone the repository
git clone https://github.com/satyamhq/Patient-Friction-Intelligence-System.git
cd Patient-Friction-Intelligence-System

# Start container cluster
docker compose up -d --build
```

### Viewing Logs
```bash
docker compose logs -f server
```

---

## 2. Bare-Metal / VPS Deployment (PM2 + Nginx)

For high-performance single-server deployment:

### Backend
```bash
cd server
npm install --production
npm run build
pm2 start dist/server.js --name "pfis-api"
```

### Frontend
```bash
cd client
npm install
npm run build
# The dist/ directory can now be served by Nginx or Caddy
```

### Sample Nginx Configuration
```nginx
server {
    listen 80;
    server_name pfis.example.org;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/pfis/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Security Recommendations for Self-Hosters

1. **Disable Public Demo Mode**: Set `DEMO_MODE=false` in production.
2. **Configure Strong Secrets**: Change `JWT_SECRET` and database passwords.
3. **Enable TLS/SSL**: Use Let's Encrypt / Certbot with your reverse proxy.
4. **Data Privacy**: Ensure that any real institutional patient data complies with local statutory privacy regulations (e.g., HIPAA, GDPR, DISHA). PFIS does not require real patient identifiers to model aggregate geographic friction.
