FROM alpine

RUN apk add --no-cache nginx curl iproute2 iputils

COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html /var/lib/nginx/html/index.html
COPY start.sh /start.sh

RUN chmod +x /start.sh

CMD ["/start.sh"]
