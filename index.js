const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8oqwp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const movieCollection = client.db("portal").collection("movies");
    const favoriteMovieCollection=client.db("portal").collection("favoriteMovies");

    app.get('/sorted-movies', async (req, res) => {
      const cursor = movieCollection.find().sort({ rating: -1 });
      const result = await cursor.toArray();
      res.send(result);
    })
    
    app.get('/movies', async (req, res) => {
      const search = req.query.search;
      let option={}
      if(search){
        option = { title: { $regex: search, $options: 'i' } }
      }
      const cursor = movieCollection.find(option);
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/movie/:id', async (req, res) => {
      const id = req.params.id;
      const result = await movieCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    })
    app.post('/add', async (req, res) => {
      const data = req.body;
      const result = await movieCollection.insertOne(data);
      res.send(result)
    })
    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedMovie = {
        $set: {
          title: data.title,
          genres: data.genres.map(g => g.value),
          year: data.year.value,
          rating: data.rating,
          duration: parseFloat(data.duration),
          summary: data.summary,
          poster: data.poster
        }
      }
      const result = await movieCollection.updateOne(filter, updatedMovie, options);
      res.send(result)
    })
    app.delete('/delete/:id', async (req, res) => {
      const id = req.params.id;
      const result = await movieCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result)
    })
    app.get('/favorite-movies/:email', async (req, res) => {
      const email = req.params.email;
      const cursor = favoriteMovieCollection.find({ email });
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/find-favorite-movie', async (req, res) => {
      const { email, movieId } = req.query;
      const result = await favoriteMovieCollection.findOne({ email, movieId });
      res.send(result);
    })
    app.post('/add-favorite', async (req, res) => {
      const data = req.body;
      const result = await favoriteMovieCollection.insertOne(data);
      res.send(result)
    })
    app.delete('/delete-favoriteMovie/:id', async (req, res) => {

        
      const id = req.params.id;
      
      const result = await favoriteMovieCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result)
    })
    app.delete('/delete-favoriteMovie-with-email-movieId', async (req, res) => {

      const { email, movieId } = req.query;
     
      const result = await favoriteMovieCollection.deleteOne({ email, movieId });
      res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello World');
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})