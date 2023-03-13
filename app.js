const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flagRouter = require('./routes/flags');
const appRouter = require('./routes/apps');
const environmentRouter = require('./routes/environments');
const config = require('./config');

// Connect to database
mongoose.connect(config.mongoConnectionString, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.error('Error connecting to database:', err);
  });

const app = express();

const port = process.env.PORT || 3000;
app.set('port', port);

app.use(bodyParser.json());
app.use('/api/flags', flagRouter);
app.use('/api/apps', appRouter);
app.use('/api/environments', environmentRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
