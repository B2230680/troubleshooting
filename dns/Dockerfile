FROM ubuntu:24.04

RUN apt update && \
    apt install -y bind9 bind9utils iproute2 && \
    rm -rf /var/lib/apt/lists/*

COPY named.conf /etc/bind/named.conf
COPY named.conf.local /etc/bind/named.conf.local
COPY db.example.test /etc/bind/db.example.test
COPY start.sh /start.sh

RUN chmod +x /start.sh

CMD ["/start.sh"]
