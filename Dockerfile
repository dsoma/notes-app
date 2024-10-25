FROM node:20

RUN apt-get update -y && apt-get upgrade -y && apt-get -y install curl build-essential git iputils-ping

ENV DEBUG="notes:*"
ENV REQ_LOG_FORMAT="common"
ENV HOST="0.0.0.0"
ENV DB_CONFIG="sequelize-mysql.yaml"
ENV NOTES_DB="sequelize"
ENV USER_SERVICE_URL="http://svc-user-auth:3301"

RUN mkdir -p /notes /notes/models /notes/partials /notes/public /notes/routes /notes/theme /notes/views

COPY models/ /notes/models/
COPY partials/ /notes/partials/
COPY public/ notes/public/
COPY routes/ notes/routes/
COPY theme/ /notes/theme/
COPY views/ /notes/views/
COPY *.js package.json /notes/

WORKDIR /notes

RUN npm install --unsafe-perm

EXPOSE 3000

CMD [ "node", "./app.js" ]

