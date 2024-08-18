import express from 'express';

const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get('/api/greeting', (req, res) => {
    res,json =({message: 'Hello from the server'});
});
