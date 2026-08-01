#!/bin/bash
# ============================================
# MitID Clone - Full Ubuntu VPS Setup
# Run as root: sudo bash setup.sh
# ============================================

set -e

echo ""
echo "=========================================="
echo "  MitID Clone - VPS Setup"
echo "=========================================="

# 1. System update
echo ""
echo "[1/10] Updating system..."
apt update && apt upgrade -y

# 2. Install Node.js 22
echo ""
echo "[2/10] Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 3. Install PostgreSQL
echo ""
echo "[3/10] Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# 4. Start PostgreSQL
echo ""
echo "[4/10] Starting PostgreSQL..."
systemctl enable postgresql
systemctl start postgresql

# 5. Create database
echo ""
echo "[5/10] Creating database..."
sudo -u postgres psql -c "CREATE USER mitid WITH PASSWORD 'mitid123';"
sudo -u postgres psql -c "CREATE DATABASE mitid OWNER mitid;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mitid TO mitid;"

# 6. Install PM2
echo ""
echo "[6/10] Installing PM2..."
npm install -g pm2

# 7. Create project directory
echo ""
echo "[7/10] Setting up project directory..."
mkdir -p /var/www/mitid

# 8. Upload or clone your code here
echo ""
echo "[8/10] Clone or upload your code to /var/www/mitid"
echo "  Option A: git clone https://github.com/your-repo.git /var/www/mitid"
echo "  Option B: scp -r ./local-project root@YOUR-IP:/var/www/mitid"

# 9. Create .env
echo ""
echo "[9/10] Creating .env file..."
cat > /var/www/mitid/.env << 'EOF'
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

# 10. Install Nginx
echo ""
echo "[10/10] Installing Nginx..."
apt install -y nginx

echo ""
echo "=========================================="
echo "  SETUP COMPLETE"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Upload your code:"
echo "   scp -r C:\\Users\\amitr\\OneDrive\\Desktop\\Miitid\\* root@YOUR-IP:/var/www/mitid/"
echo ""
echo "2. Build and start:"
echo "   cd /var/www/mitid"
echo "   npm install"
echo "   npm run build"
echo "   pm2 start server/index.js --name mitid"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "3. Setup Nginx:"
echo "   nano /etc/nginx/sites-available/mitid"
echo "   (paste nginx config)"
echo "   ln -s /etc/nginx/sites-available/mitid /etc/nginx/sites-enabled/"
echo "   nginx -t"
echo "   systemctl restart nginx"
echo ""
echo "4. Open firewall:"
echo "   ufw allow 'Nginx Full'"
echo "   ufw allow 3001"
echo "   ufw enable"
echo ""
echo "5. Test:"
echo "   http://YOUR-VPS-IP"
echo ""
echo "=========================================="
