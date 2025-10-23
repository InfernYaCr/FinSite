FROM nginx:1.27-alpine

RUN apk add --no-cache nginx-mod-http-brotli

COPY nginx.conf /etc/nginx/nginx.conf
COPY finsite.conf /etc/nginx/conf.d/finsite.conf

RUN mkdir -p /var/www/certbot && \
    chown -R nginx:nginx /var/www/certbot /var/cache/nginx

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
