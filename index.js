const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // enable CORS

app.get('/spaces', async (req, res) => {
  const assignee = '0';
  const token = req.headers.authorization;

  const options1 = {
    method: 'GET',
    url: `https://api.clickup.com/api/v2/team/3701918/space`,
    headers: {
      Authorization: token,
    },
  };

  try {
    const response1 = await axios(options1);
    const spaces = response1.data.spaces;

    // Construct an array of promises for each space ID
    const spaceIds = spaces.map((space) => {
      return {
        id: space.id,
        name: space.name,
      };
    });
    const requests = spaceIds.map((spaceId) => {
      const options2 = {
        method: 'GET',
        url: `https://api.clickup.com/api/v2/space/${spaceId.id}/list`,
        headers: {
          Authorization: token,
        },
      };
      return axios(options2);
    });

    // Wait for all the promises to resolve and get the lists data
    const responses = await Promise.all(requests);
    const lists = responses.map((response) => response.data.lists);
    console.log(lists);

    // Map the results together as needed
    const mergedResult = {
      spaces: spaceIds.map((space, index) => {
        return {
          id: space.id,
          name: space.name,
          lists: lists[index].map((list) => {
            return {
              id: list.id,
              name: list.name,
              folder: list.folder,
              color: list?.status?.color,
            };
          }),
        };
      }),
    };

    res.status(200).send(mergedResult);
  } catch (error) {
    console.error(error);
    res.status(401).send('Unauthorized');
    res.status(500).send('An error occurred', error);
  }
});

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

app.get('/all-tasks', async (req, res) => {
  const token = req.headers.authorization;
  const todayInUnixTimeInMilliseconds = new Date().getTime();
  const todayStart = new Date(todayInUnixTimeInMilliseconds).setHours(
    0,
    0,
    0,
    0
  );
  const todayEnd = new Date(todayInUnixTimeInMilliseconds).setHours(
    23,
    59,
    59,
    999
  );
  const options = {
    method: 'GET',
    url: `https://api.clickup.com/api/v2/team/3701918/time_entries`,
    headers: {
      Authorization: token,
    },
    params: {
      start_date: todayStart,
      end_date: todayEnd,
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
