# Local dev

**MongoDB**
```
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Redis**
```
brew install redis
brew services start redis
```

**Node**
```
npm install
npm run dev
```

**Docker**
To run using docker, simply:
```
docker-compose up -d
```
Once up and running, Swagger docs are available at http://localhost:3000/api-docs