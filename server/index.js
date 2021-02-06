const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");
const userRouter = require('./routes/userRouter');
const betsRouter = require('./routes/betsRouter');
const groupRouter = require('./routes/groupRouter');
const otherRouter = require('./routes/otherRouter');
require('dotenv').config();

const app = express();

app.use(bodyParser.json({limit:"30mb", extended:true}))
app.use(bodyParser.urlencoded({limit:"30mb", extended:true}))
app.use(cors());

app.use("/public", express.static(path.join(__dirname, "/public")));
app.use(userRouter);
app.use(betsRouter);
app.use(groupRouter);
app.use(otherRouter);

app.get('/', (req, res) => {
    res.send('Hello to bet app!')  
})

const CONNECTION_URL = process.env.CONNECTION_URL;
const PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL, {useNewUrlParser:true, useUnifiedTopology: true}).then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`))).catch((err) => console.log(err.message))

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
