FROM frrouting/frr:latest

COPY daemons /etc/frr/daemons
COPY frr-static.conf /frr-static.conf
COPY iproute.sh /iproute.sh
COPY start.sh /start.sh

RUN chmod +x /iproute.sh /start.sh

CMD ["/start.sh"]
