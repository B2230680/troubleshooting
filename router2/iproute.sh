#!/bin/sh

#ip addr flush dev eth0
#ip addr flush dev eth1

#ip addr add 192.168.12.2/24 dev eth0
#ip addr add 192.168.20.1/24 dev eth1

#ip link set eth0 up
#ip link set eth1 up

ip route del default

sysctl -w net.ipv4.ip_forward=1
