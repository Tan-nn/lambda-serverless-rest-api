const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const uuid = require('node-uuid');

const { TODOS_TABLE, LEVEL_TABLE, GROUP_TABLE, LECTURE_TABLE, IS_OFFLINE} = process.env;

const dynamoDb = IS_OFFLINE === 'true' ?
  new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  }) :
  new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

app.get('/ielts-reading-level', (req, res) => {
  console.log('xxxx', req.params)
  const params = {
    TableName: LEVEL_TABLE,
  };

  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Error retrieving Levels'});
    }
    console.log('result', result)
    const { Items: levels } = result;

    res.json(levels);
  })
});

app.get('/ielts-reading-group/:levelSlug', (req, res) => {
  const { levelSlug } = req.params;

  const params = {
    TableName: GROUP_TABLE,
    IndexName: 'levelSlugIndex',
    KeyConditionExpression: 'levelSlug = :ls',
    ExpressionAttributeValues: { ':ls': levelSlug}
  };

  console.log('params:: ', params)

  dynamoDb.query(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Error retrieving Groups' });
    }

    res.json(result.Items);
  });
});

app.get('/ielts-reading-lecture/:groupSlug', (req, res) => {
  const { groupSlug } = req.params;

  const params = {
    TableName: LECTURE_TABLE,
    IndexName: 'groupSlugIndex',
    KeyConditionExpression: 'groupSlug = :gs',
    ExpressionAttributeValues: { ':gs': groupSlug}
  };

  dynamoDb.query(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Error retrieving Lecture' });
    }

    res.json(result.Items);
  });
});


app.post('/ielts-reading-level/bulk', (req, res) => {
  const {data} = req.body;
  for(item of data) {
    item.id =  uuid.v4();
    const params = {
      TableName: LEVEL_TABLE,
      Item: item
    };
  
    dynamoDb.put(params, (error) => {
      if (error) {
        console.log('Error creating Level: ', error);
        // res.status(400).json({ error: 'Could not create Lecture' });
      }
    });
  }
  res.json(data);
});


app.post('/ielts-reading-group/bulk', (req, res) => {
  const {data} = req.body;
  for(item of data) {
    item.id =  uuid.v4();
    const params = {
      TableName: GROUP_TABLE,
      Item: item
    };
  
    dynamoDb.put(params, (error) => {
      if (error) {
        console.log('Error creating Group: ', error);
        // res.status(400).json({ error: 'Could not create Lecture' });
      }
    });
  }
  res.json(data);
});

app.post('/ielts-reading-lecture/bulk', (req, res) => {
  const {data} = req.body;
  for(item of data) {
    item.id =  uuid.v4();
    const params = {
      TableName: LECTURE_TABLE,
      Item: item
    };

    console.log('params:: ', params)
  
    dynamoDb.put(params, (error) => {
      if (error) {
        console.log('Error creating Lecture: ', error);
        // res.status(400).json({ error: 'Could not create Lecture' });
      }
    });
  }
  res.json(data);
});




// app.put('/todos', (req, res) => {
//   const { todoId, title, done } = req.body;

//   var params = {
//     TableName : TODOS_TABLE,
//     Key: { todoId },
//     UpdateExpression : 'set #a = :title, #b = :done',
//     ExpressionAttributeNames: { '#a' : 'title', '#b': 'done' },
//     ExpressionAttributeValues : { ':title' : title, ':done': done },
//   };

//   dynamoDb.update(params, (error) => {
//     if (error) {
//       console.log(`Error updating Todo with id ${todoId}: `, error);
//       res.status(400).json({ error: 'Could not update Todo' });
//     }

//     res.json({ todoId, title, done });
//   })
// });

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