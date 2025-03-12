#!/bin/sh
aws ecr get-login-password --profile notes-app --region us-west-2 \
| docker login --username AWS \
--password-stdin 813234997819.dkr.ecr.us-west-2.amazonaws.com
# aws ecr get-login-password --profile notes-app --region us-west-2 \
# | nerdctl login --username AWS \
# --password-stdin 813234997819.dkr.ecr.us-west-2.amazonaws.com
