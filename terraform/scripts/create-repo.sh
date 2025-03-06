aws ecr create-repository --profile notes-app --region us-west-2 --repository-name svc-notes --image-scanning-configuration scanOnPush=true
aws ecr create-repository --profile notes-app --region us-west-2 --repository-name svc-user-auth --image-scanning-configuration scanOnPush=true
