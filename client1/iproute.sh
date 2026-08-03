#!/bin/sh

#ip addr flush dev eth0

#ip addr add 192.168.20.10/24 dev eth0

ip link set eth0 up

ip route del default
ip route add default via 192.168.20.10
