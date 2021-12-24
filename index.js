const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

//Create the mongo client to use
const client = new MongoClient(process.env.MONGO_URL);

const app = express();
const port = process.env.PORT || 1337;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors())

//Root route
app.get('/', (req, res) => {
    res.status(300).redirect('/index.html');
});

// DONE Return all Tea from the database
app.get('/teas', async (req, res) =>{

    try{
        //connect to the db
        await client.connect();

        //retrieve the tea of collection data
        const colli = client.db('teaproject').collection('teas');
        const chs = await colli.find({}).toArray();

        //Send back the data with the response
    res.status(200).send(chs);
    }catch(error){
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

app.get('/teas/:id', async (req,res) => {
    //id is located in the query: req.params.id
    try{
        //connect to the db
        await client.connect();

        //retrieve the boardgame collection data
        const colli = client.db('teaproject').collection('teas');

        //only look for a tea with this ID
        const query = { _id: ObjectId(req.params.id)};

        const tea = await colli.findOne(query);

        if(tea){
            //Send back the file
              res.status(200).send(tea);
            return;
        }else{
            res.status(400).send('teas could not be found with id: ' + req.params.id);
        }
      
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

// DONE save the teas
app.post('/teas', async (req, res) => {

    if(!req.body.name || !req.body.details || !req.body.ingredients || !req.body.make || !req.body.time || !req.body.water){
        res.status(400).send('Bad request: missing name, details, ingredients, make, time or water');
        return;
    }

    try{
        //connect to the db
        await client.connect();

        //retrieve the boardgame collection data
        const colli = client.db('teaproject').collection('teas');

        // Validation for double teas
        const bg = await colli.findOne({name: req.body.name, details: req.body.details});
        if(bg){
            res.status(400).send(`Bad request: tea already exists with name ${req.body.name} for details ${req.body.details}`);
            return;
        } 
        // Create the new tea object
        let newTea = {
            name: req.body.name,
            details: req.body.details,
            ingredients: req.body.ingredients,
            make: req.body.make,
            time: req.body.time,
            water: req.body.water
        }
        // Insert into the database
        let insertResult = await colli.insertOne(newTea);

        //Send back successmessage
    res.status(201).json(newTea);
        return;
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

//Update tea
app.put('/teas/:id', async (req,res) => {
    //Check for body data
    if(!req.body.name || !req.body.details || !req.body.ingredients || !req.body.make || !req.body.time || !req.body.water){
        res.status(400).send({
            error: 'Bad Request',
            value: 'Missing name, details, ingredients, make, time or water property'
        });
        return;
    }
    // Check for id in url
    if(!req.params.id){
        res.status(400).send({
            error: 'Bad Request',
            value: 'Missing id in url'
        });
        return;
    }

    try{
         //connect to the db
        await client.connect();

         //retrieve the teas collection data
        const colli = client.db('teaproject').collection('teas');

         // Validation for existing tea
        const bg = await colli.findOne({_id: ObjectId(req.params.id)});
        if(!bg){
            res.status(400).send({
                error: 'Bad Request',
                value: `Tea does not exist with id ${req.params.id}`
            });
            return;
        } 
         // Create the new Tea object
        let newTea = {
            name: req.body.name,
            details: req.body.details,
            ingredients: req.body.ingredients,
            make: req.body.make,
            time: req.body.time,
            water: req.body.water
        }
        
         // Insert into the database
        let updateResult = await colli.updateOne({_id: ObjectId(req.params.id)}, 
        {$set: newTea});

         //Send back successmessage
        res.status(201).json(updateResult);
        return;
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

// delete Tea
app.delete('/teas/:id', async (req,res) => {
    if(!req.params.id){
        res.status(400).send({
            error: 'Bad Request',
            value :'No id available in url'
        });
        return;
    }

    try{
        //connect to the db
        await client.connect();

        //retrieve the boardgame collection data
        const colli = client.db('teaproject').collection('teas');

        // Validation for double teas
        const bg = await colli.deleteOne({_id: ObjectId(req.params.id)});
        //Send back successmessage
        res.status(201).json(result);
        return;
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});


app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})