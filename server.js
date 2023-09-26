const { createApp } = require('./app');
const mongoose = require('mongoose')
require('dotenv').config();

const startServer = async () => {
  const app = createApp();

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, async () => {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,})
      .then(() => {
        console.log('Data Source has been initialized!');
      })
      .catch((error) => {
        console.error('Error during Data Source initialization', error);
      });
    console.log(`Listening to request on 127.0.0.1:${PORT}`);
  });
};

startServer();