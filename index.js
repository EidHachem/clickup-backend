const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // enable CORS

app.get('/time-entries', async (req, res) => {
  const assignee = '0';
  const token = req.headers.authorization;

  const options = {
    method: 'GET',
    url: `https://api.clickup.com/api/v2/team/3701918/time_entries/current`,
    headers: {
      Authorization: token,
    },
  };

  try {
    const response = await axios(options);
    res.status(200).send(response.data);
  } catch (error) {
    console.error(error);
    res.status(401).send('Unauthorized');
    res.status(500).send('An error occurred', error);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
