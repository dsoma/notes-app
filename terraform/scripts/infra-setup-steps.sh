
terraform plan
terraform apply

scp ../../aws/notes-app.pem ubuntu@<PUBLIC_IP>
ssh ubuntu@<PUBLIC_IP>

# Inside the notes-app-ec2-public instance
sudo hostname notes-app-public
sudo docker node update --label-add type=public notes-app-public
sudo docker node ls

sudo docker swarm join-token manager
ssh -i notes-app.pem <PRIVATE_DNS_NODE1>
#Execute docker swarm join of node-1 inside node-1
docker node update --label-add type=<TYPE> <INSTANCE_NAME>
exit

sudo docker swarm join-token manager
ssh -i notes-app.pem <PRIVATE_DNS_NODE2>
#Execute docker swarm join of node-2 inside node-2
docker node update --label-add type=<TYPE> <INSTANCE_NAME>
exit

sudo docker node ls
docker context rm ec2
docker context create ec2 --docker host=ssh://ubuntu@<PUBLIC_IP>
docker context use ec2
docker node ls

printf '<TWITTER_CONSUMER_KEY>' | docker secret create TWITTER_CONSUMER_KEY -
printf '<TWITTER_CONSUMER_SECRET>' | docker secret create TWITTER_CONSUMER_SECRET -

sh ec2-login.sh



