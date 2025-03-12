# Create EC2 instances for the stack using terraform
terraform plan
terraform apply

# Copy key pair file to the public instance
scp ../../aws/notes-app.pem ubuntu@<PUBLIC_IP>
ssh ubuntu@<PUBLIC_IP>

# Inside the notes-app-ec2-public instance: Update the label
sudo hostname notes-app-public
sudo docker node update --label-add type=public notes-app-public
sudo docker node ls

# Join the other private instance/node to the master node/public instance
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

# Create a docker context to run docker commands from local
sudo docker node ls
docker context use default
docker context rm ec2
docker context create ec2 --docker host=ssh://ubuntu@<PUBLIC_IP>
docker context use ec2
docker node ls

# create docker secrets
printf '<TWITTER_CONSUMER_KEY>' | docker secret create TWITTER_CONSUMER_KEY -
printf '<TWITTER_CONSUMER_SECRET>' | docker secret create TWITTER_CONSUMER_SECRET -

sh ec2-login.sh

# Adjust Twitter callback url env var and on https://developer.x.com/en/portal/projects/1846644753611517952/apps/29477198/settings
