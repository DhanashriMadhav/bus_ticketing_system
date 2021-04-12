const exprees= require("express");
const connectDB =require("./config/db.js");
const bodyParser = require('body-parser')

const app = exprees()
app.use(bodyParser.json())

connectDB();

const apiRoutes = require("./route/ticket.js")
const user = require('./route/auth.js')
const bus=require("./route/bus.js")
app.use('/api', apiRoutes)
app.use('/api', user)
app.use('/api',bus)


// listen for requests
app.listen(7900, () => {
   console.log("Server is listening on port 7900");
});


 
