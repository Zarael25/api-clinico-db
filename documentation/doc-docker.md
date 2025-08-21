# Docker MongoDB

### Create User and Roles

```sh
docker compose exec mongo bash
docker-compose exec mongo bash

mongosh -u root -p example
show dbs
use admin
db.createUser({
  user:"dbadmin",
  pwd: "M1PassD0B",
  roles:["dbOwner"]
})
use donbosco
db.createUser({
  user:"dbadmin",
  pwd: "M1PassD0B",
  roles:["dbOwner"]
})
```

### Revisar si hay una instancia de docker-compose corriendo

```sh
docker ps

cd [path-otro-proyecto]
docker-compose down

cd [path-mi-proyecto]
docker-compose up -d
```

### Backup Docker Compose and MongoDB

```sh
cd documentation
rm -R backup # de api-clinico-db/documentation
docker-compose exec mongo bash # Ingresar al contenedor docker
docker compose exec mongo bash
rm -R backup # del contenedor docker
exit # Salirse del contenedor
docker exec -t container-donbosco mongodump -u dbadmin -p 'M1PassD0B' --db donbosco --host localhost:27017 --out /backup/ # desde api-clinico-db/documentation
cd ~/coder/backups
rm -rf backup
ll
docker cp container-donbosco:/backup backup
zip -r backup.zip backup
exit
```

### Restore

```sh
cd ~/coder/backups/
rm -rf backup
scp -r [user]@[ip-server]:/home/[user-server]/coder/backups/backup.zip /home/[user-pc]/coder/backups/
# Copiar el backup a otra carpeta y renombrar a la fecha actual
unzip backup.zip
docker cp backup container-donbosco:/tmp/

cd ~/coder/db-clinico/api-clinico-db
docker compose exec mongo bash
docker-compose exec mongo bash
mongosh donbosco -u dbadmin -p 'M1PassD0B'
>show collections
>db.dropDatabase()
>show collections
>exit
mongorestore -u dbadmin -p 'M1PassD0B' --db donbosco /tmp/backup/donbosco
rm -rf /tmp/backup
exit
```
