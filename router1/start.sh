#!/bin/sh

/iproute.sh

cp /frr-static.conf /etc/frr/frr.conf

/usr/lib/frr/frrinit.sh start

tail -f /dev/null
