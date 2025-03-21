#!/bin/sh
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get -y install apt-transport-https \
    ca-certificates curl gnupg-agent git software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
sudo groupadd docker
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo docker swarm init
sudo hostname notes-app-public
sudo docker node update --label-add type=public notes-app-public
mkdir /home/ubuntu/etc-letsencrypt
mkdir /home/ubuntu/webroots
mkdir /home/ubuntu/nginx-conf-d
