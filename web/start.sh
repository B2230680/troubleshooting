#!/bin/sh

ip route del default
ip route add default via 192.168.30.10

nginx

sleep infinity
