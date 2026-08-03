#!/bin/sh

docker exec router3 vtysh -c "configure terminal" \
			  -c "no ip route 192.168.20.0/24 192.168.13.10" \
			  -c "ip route 192.168.20.0/24 192.168.13.100"


