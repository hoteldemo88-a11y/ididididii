#!/bin/bash
# ============================================
# Fresh VPS Setup - Run once on new Ubuntu VPS
# Usage: sudo bash setup.sh
# ============================================

set -e

echo ""
echo "=========================================="
echo "  MitID Clone - Fresh VPS Setup"
echo "=========================================="

# 1. Update system
echo ""
echo "[1/9] Updating system..."
apt update && apt upgrade -y

# 2. Install Node.js 22
echo ""
echo "[2/9] Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 3. Install PostgreSQL
echo ""
echo "[3/9] Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# 4. Start PostgreSQL
echo ""
echo "[4/9] Starting PostgreSQL..."
systemctl enable postgresql
systemctl start postgresql

# 5. Create database
echo ""
echo "[5/9] Creating database..."
sudo -u postgres psql -c "CREATE USER mitid WITH PASSWORD 'mitid123';"
sudo -u postgres psql -c "CREATE DATABASE mitid OWNER mitid;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mitid TO mitid;"

# 6. Install PM2
echo ""
echo "[6/9] Installing PM2..."
npm install -g pm2

# 7. Install Nginx
echo ""
echo "[7/9] Installing Nginx..."
apt install -y nginx

# 8. Clone repo
echo ""
echo "[8/9] Cloning repository..."
mkdir -p /var/www
git clone https://github.com/hoteldemo88-a11y/ididididii.git /var/www/mitid
cd /var/www/mitid

# 9. Setup .env
echo ""
echo "[9/9] Creating .env..."
cat > .env << 'EOF'
DB_USER=mitid
DB_HOST=localhost
DB_NAME=mitid
DB_PASSWORD=mitid123
DB_PORT=5432
PORT=3001
JWT_SECRET=mitid_admin_secret_key_2026
ADMIN_EMAIL=admin@mitid.com
ADMIN_PASSWORD=admin123
EOF

# Setup Nginx
cat > /etc/nginx/sites-available/mitid << 'NGINX'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/mitid /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Build and start
echo ""
echo "Building and starting..."
npm install
npm run build
pm2 start server/index.js --name mitid
pm2 save
pm2 startup

# Open firewall
ufw allow 'Nginx Full' 2>/dev/null || true
ufw allow OpenSSH 2>/dev/null || true

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me)

echo ""
echo "=========================================="
echo "  SETUP COMPLETE"
echo "=========================================="
echo ""
echo "  Website: http://$PUBLIC_IP"
echo "  Admin:   http://$PUBLIC_IP/#admin-login"
echo "  Email:   admin@mitid.com"
echo "  Pass:    admin123"
echo ""
echo "  To deploy updates: bash deploy.sh"
echo "=========================================="
