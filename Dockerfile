FROM node:24

RUN apt install git

RUN mkdir -p /app/capn-mod-tools

CMD /bin/sh