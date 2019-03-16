const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const sqliteDB = require('./sqlite')

app.use(bodyParser.json({ strict: false }));

app.get('/init', async (req, res) => {
  try {
    await sqliteDB.init()
    res.json({ status: 'ok' })
  } catch (error) {
    res.json({ error })
  }
});

app.get('/ielts-reading-level', async (req, res) => {
  try {
    res.json(await sqliteDB.getLevels())
  } catch (error) {
    res.json({ error })
  }
});

app.get('/ielts-reading-group/:levelSlug', async(req, res) => {
  try {
    const { levelSlug } = req.params;
    res.json(await sqliteDB.getGroupsByLevelSlug(levelSlug));
  } catch (error) {
    res.json({ error })
  }
});

app.get('/ielts-reading-lecture/:groupSlug', async(req, res) => {
  try {
    const { groupSlug } = req.params;
    res.json(await sqliteDB.getLectureByGroupSlug(groupSlug));
  } catch (error) {
    res.json({ error })
  }
});

app.post('/ielts-reading-level/bulk', async(req, res) => {
  try {
    const { data } = req.body;
    await sqliteDB.insertBulk('levels', data);
    res.json({ status: 'ok' })
  } catch (error) {
    res.json({ error })
  }
});

app.post('/ielts-reading-group/bulk', async(req, res) => {
  try {
    const { data } = req.body;
    await sqliteDB.insertBulk('groups', data);
    res.json({ status: 'ok' })
  } catch (error) {
    res.json({ error })
  }
});

app.post('/ielts-reading-lecture/bulk', async(req, res) => {
  try {
    const { data } = req.body;
    await sqliteDB.insertBulk('lectures', data);
    res.json({ status: 'ok' })
  } catch (error) {
    res.json({ error })
  }
});

app.delete('/level/:id', (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: LEVEL_TABLE,
    Key: {
      id,
    },
  };

  dynamoDb.delete(params, (error) => {
    if (error) {
      console.log(`Error updating Level with id ${id}`, error);
      res.status(400).json({ error: 'Could not delete Level' });
    }

    res.json({ success: true });
  });
});

module.exports.handler = serverless(app);