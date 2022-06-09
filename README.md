# Installation

1. Lancer `npm install` dans le répertoire `server` et dans le répertoire `client`
2. Il est nécessaire de lancer le serveur et le client:
   1. Lancer dans `server`: `node ./`
   2. Lancer dans `client`: `npm run serve`


Le testeur USB a des problèmes pour se déconnecter, il est donc nécessaire de terminer et relancer le serveur entre chaque connexion.

# Docker

Image : https://hub.docker.com/repository/docker/samueldarras/um34c/
Commande: `sudo docker run --net=host --privileged -p 8080:8080 -p 4000:4000 -d <nom-d'image>`

# um34c

structure des données copiées de : https://github.com/sebastianha/um34c
