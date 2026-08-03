FROM ubuntu:24.04

RUN apt-get update && \
    apt-get install -y \
        iproute2 \
        iputils-ping \
        traceroute \
        dnsutils \
        net-tools \
        curl \
        nano

COPY iproute.sh /iproute.sh
COPY start.sh /start.sh

RUN chmod +x /iproute.sh /start.sh

CMD ["/start.sh"]
