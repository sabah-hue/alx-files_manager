import express from 'express';
import router from './routes/index';

// Express server
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/', router);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server running on port ${PORT}`);
});

export default app;
