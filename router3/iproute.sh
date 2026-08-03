#!/bin/sh

#ip addr flush dev eth0
#ip addr flush dev eth1

#ip addr add 192.168.13.2/24 dev eth0
#ip addr add 192.168.30.1/24 dev eth1

#ip link set eth0 up
#ip link set eth1 up

sysctl -w net.ipv4.ip_forward=1
