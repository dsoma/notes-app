# Since docker daemon is not allowed in the default context, use ec2 context just to create and push images.
docker tag svc-notes:latest 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-notes:latest
docker tag svc-user-auth:latest 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-user-auth:latest

docker push 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-notes:latest
docker push 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-user-auth:latest

# nerdctl tag svc-notes:latest 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-notes:latest
# nerdctl tag svc-user-auth:latest 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-user-auth:latest

# nerdctl push 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-notes:latest
# nerdctl push 813234997819.dkr.ecr.us-west-2.amazonaws.com/svc-user-auth:latest
