FROM alpine

RUN apk add --no-cache iproute2 iputils curl

COPY start.sh /start.sh

RUN chmod +x /start.sh

CMD ["/start.sh"]
