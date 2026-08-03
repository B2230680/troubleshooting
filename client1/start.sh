#!/bin/sh

/iproute.sh

echo "nameserver 192.168.30.30" > /etc/resolv.conf

tail -f /dev/null
