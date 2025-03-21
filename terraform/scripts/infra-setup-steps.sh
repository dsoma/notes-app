# Create EC2 instances for the stack using terraform
terraform plan
terraform apply

# Copy key pair file to the public instance
sudo scp ../../aws/notes-app-0305.pem ubuntu@<PUBLIC_IP>:~/
#ssh ubuntu@<PUBLIC_IP>

# Inside the notes-app-ec2-public instance: Update the label
ssh ubuntu@<PUBLIC_IP> sudo hostname notes-app-public
ssh ubuntu@<PUBLIC_IP> sudo docker node update --label-add type=public notes-app-public
ssh ubuntu@<PUBLIC_IP> sudo docker node ls

# Join the other private instance/node to the master node/public instance
ssh ubuntu@<PUBLIC_IP> sudo docker swarm join-token manager
ssh ubuntu@<PUBLIC_IP>
ssh -i notes-app-0305.pem <PRIVATE_DNS_NODE1>
# ex: ssh -i notes-app-0305.pem ip-10-0-3-194.us-west-2.compute.internal
#Execute docker swarm join of node-1 inside node-1
docker swarm join --token <TOKEN> <ARG>
docker node update --label-add type=<TYPE> <INSTANCE_NAME>
# ex: docker node update --label-add type=svc notes-app-private-svc1
exit

sudo docker swarm join-token manager
ssh -i notes-app-0305.pem <PRIVATE_DNS_NODE2>
#Execute docker swarm join of node-2 inside node-2
docker swarm join --token <TOKEN> <ARG>
docker node update --label-add type=<TYPE> <INSTANCE_NAME>
# ex: docker node update --label-add type=db notes-app-private-db1
exit

# Create a docker context to run docker commands from local
sudo docker node ls
docker context use default
docker context rm ec2
docker context create ec2 --docker host=ssh://ubuntu@<PUBLIC_IP>
docker context use ec2
docker node ls

# create docker secrets: Replace <TWITTER_CONSUMER_KEY> and <TWITTER_CONSUMER_SECRET> with actual values
printf '<TWITTER_CONSUMER_KEY>' | docker secret create TWITTER_CONSUMER_KEY -
printf '<TWITTER_CONSUMER_SECRET>' | docker secret create TWITTER_CONSUMER_SECRET -

sh ec2-login.sh

# Adjust Twitter callback url env var and on https://developer.x.com/en/portal/projects/1846644753611517952/apps/29477198/settings

# Update images before deployment of the stack: (Use ec2 docker context)
# (From /notes-app/)
docker build -t svc-notes .
docker tag svc-notes:latest 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-notes:latest
docker push 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-notes:latest

# (From /user-auth-server/)
docker build -t svc-user-auth .
docker tag svc-user-auth:latest 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-user-auth:latest
docker push 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-user-auth:latest

# cronginx config
ssh ubuntu@<PUBLIC_IP> sudo chown ubuntu nginx-conf-d
# scp initial-notes.deesoma.com.conf ubuntu@<PUBLIC_IP>:/home/ubuntu/nginx-conf-d/notes.deesoma.com.conf
scp notes.deesoma.com.conf ubuntu@<PUBLIC_IP>:/home/ubuntu/nginx-conf-d/notes.deesoma.com.conf

# Deploy stack (from root dir)
docker stack deploy --with-registry-auth --compose-file compose.yaml notes-app

# Check services running
docker node ls
docker node ps <node_id>

# A node leaving the swarm:
# docker swarm leave --force

# Add a db entry into user db:
ssh ubuntu@<PUBLIC_IP>
ssh -i notes-app-0305.pem <PRIVATE_DNS_NODE1>
docker exec -it <CONTAINER_ID> bash
# ex: docker exec -it notes-app_svc-user-auth.1.wtt177h0wd52gsimk04lek2gx bash
node ./cli.js add --given-name Deepak --family-name Somashekhara --email deepak.somashekhara@gmail.com --password <PWD> dsoma
exit
exit
exit
