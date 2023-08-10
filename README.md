


## config.js

```
$ change the credential of the Database for the connectivity

 "development": {
        "username": "username",
        "password": "password",
        "database": "db",
        "host": "127.0.0.1",
        "dialect": "postgres"
    },

```


## Setup the app

```
#install the required packages
$ npm install.

# create the Database
$ npx-sequelize-cli db:create.

# migrate the Database
$ npx-sequelize-cli db:migrate.

# seeding the Database
$ npx-sequelize-cli db:seed:all.

```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
