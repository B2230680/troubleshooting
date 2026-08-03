#!/bin/sh

#ip addr flush dev eth0
#ip addr flush dev eth1
#ip addr flush dev eth2

#ip addr add 10.0.10.2/24 dev eth0
#ip addr add 192.168.12.1/24 dev eth1
#ip addr add 192.168.13.1/24 dev eth2

#ip link set eth0 up
#ip link set eth1 up
#ip link set eth2 up

sysctl -w net.ipv4.ip_forward=1
