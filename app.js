const exprees= require("express");
const connectDB =require("./src/config/db.js");
const bodyParser = require('body-parser')
const cors = require('cors');

const app = exprees()
app.use(bodyParser.json())
app.use(cors());

connectDB();
app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
   next();
});

const apiRoutes = require("./src/route/ticket.js")
const user = require('./src/route/auth.js')
const bus=require("./src/route/bus.js")
app.use('/api', apiRoutes)
app.use('/api', user)
app.use('/api',bus)


// listen for requests
app.listen(7900, () => {
   console.log("Server is listening on port 7900");
});


 
