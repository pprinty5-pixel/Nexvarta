#!/bin/bash
# ==============================================================================
# Hostinger VPS Initial Setup Script for Nexvarta (Next.js + PM2 + Nginx)
# Run on VPS: curl -sL <link> or copy-paste these commands as root
# ==============================================================================
set -e

echo "=== 1. Updating System Packages ==="
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw nginx build-essential

echo "=== 2. Creating 2GB Swap Memory (prevents Next.js build crashes) ==="
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap created successfully."
else
    echo "Swap already exists."
fi

echo "=== 3. Installing Node.js (v20 LTS) & PM2 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

echo "=== 4. Setting up PM2 to start on boot ==="
pm2 startup systemd -u root --hp /root || true

echo "=== 5. Preparing /var/www/nexvarta Directory ==="
sudo mkdir -p /var/www/nexvarta
sudo chown -R $USER:$USER /var/www/nexvarta

echo "=== Setup complete! ==="
echo "Next steps:"
echo "1. Clone your repo: git clone <YOUR_GITHUB_REPO_URL> /var/www/nexvarta"
echo "2. Add your .env file inside /var/www/nexvarta/.env"
echo "3. Run 'npm install && npm run build'"
echo "4. Start with PM2: 'pm2 start ecosystem.config.cjs && pm2 save'"
