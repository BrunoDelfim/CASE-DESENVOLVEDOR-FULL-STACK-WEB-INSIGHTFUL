#!/bin/sh
set -e

# Instala dependências se vendor não existir (volume sobrescreve o build)
if [ ! -d /var/www/vendor ]; then
    echo "Instalando dependências do Composer..."
    composer install --no-interaction --prefer-dist
fi

# Copia o .env se não existir
if [ ! -f /var/www/.env ]; then
    cp /var/www/.env.example /var/www/.env
fi

# Garante que as variáveis do banco estão corretas no .env
sed -i '/^DB_CONNECTION=/d' /var/www/.env
sed -i '/^DB_HOST=/d' /var/www/.env
sed -i '/^DB_PORT=/d' /var/www/.env
sed -i '/^DB_DATABASE=/d' /var/www/.env
sed -i '/^DB_USERNAME=/d' /var/www/.env
sed -i '/^DB_PASSWORD=/d' /var/www/.env

echo "DB_CONNECTION=mysql" >> /var/www/.env
echo "DB_HOST=mysql" >> /var/www/.env
echo "DB_PORT=3306" >> /var/www/.env
echo "DB_DATABASE=catalog" >> /var/www/.env
echo "DB_USERNAME=laravel" >> /var/www/.env
echo "DB_PASSWORD=laravel" >> /var/www/.env

# Limpa qualquer APP_KEY duplicada ou corrompida e coloca vazia
sed -i '/^APP_KEY=/d' /var/www/.env
echo "APP_KEY=" >> /var/www/.env

# Gera uma APP_KEY limpa
php artisan key:generate --force --no-interaction

# Aguarda o MySQL estar pronto
echo "Aguardando MySQL..."
until php -r "new PDO('mysql:host=mysql;dbname=catalog', 'laravel', 'laravel');" 2>/dev/null; do
    sleep 2
done
echo "MySQL pronto!"

# Roda as migrations
php artisan migrate --force --no-interaction

# Limpa caches
php artisan config:clear
php artisan cache:clear

# Inicia o servidor
php artisan serve --host=0.0.0.0 --port=8000
