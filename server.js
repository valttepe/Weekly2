'use strict';
// Helper for separeting private data.
const dot = require('dotenv').config();
// Express for CRUID and getting so called front and backend division.
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.static('uploads'));

// Timestamp
const moment = require('moment');

// Multer for filehandling
const multer = require('multer');
// const upload = multer({dest: 'uploads/'});

const storage = multer.diskStorage({
    'destination': './uploads/',
    'filename'(req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },
});

 const upload = multer({ storage });

// resized images handling
const sharp = require('sharp');

// db connection handling
const mongoose = require('mongoose');
// 'mongodb://catAdmin:Adminpass@localhost:27017/data'
const url = 'mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/data';
// Connecting to db
mongoose.connect(url).then(() => {
  console.log('Connected successfully.');
  // if success then listen port.
  app.listen(3000);
}, (err) => {
  console.log('Connection to db failed: ' + err);
});

// Somehow useful
app.use('/modules', express.static('node_modules'));

// Creates schema
const Schema = mongoose.Schema;
const catSchema = new Schema({
    title: String,
    category: String,
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        default: 'Male',
    },
    time: String,
    image: String,
    thumbnail: String,
    medium: String,
    coordinates: {
        type: Object,
        default: {lat: 60.192059, lng: 24.945831},
    },
});

// Creates model to the cat with schema
const Cat = mongoose.model('Cat', catSchema);

// Post method. Gets data to req and sends data with res
app.post('/post-cat', upload.single('file'), function(req, res, next) {
    // req.file is the `avatar` file
    // console.log(req.file);
    const folder = 'uploads/';
    const thumbname = 'thumbnail_' + req.file.filename;
    sharp(req.file.path)
        .resize(320, 240)
        .toFile(folder + thumbname, (err, info) => {
            console.log(err);
        }
    );

    const mediumImage = 'medium_' + req.file.filename;
    sharp(req.file.path)
        .resize(720, 640)
        .toFile(folder + mediumImage, (err, info) => {
            console.log(err);
        }
    );
    const newCat = req.body;
    const now = moment().format('LLLL');
    console.log(now);
    newCat['time'] = now;
    newCat['image'] = req.file.filename;
    newCat['thumbnail'] = thumbname;
    newCat['medium'] = mediumImage;
    console.log(req.file);

    // req.body will hold the text fields, if there were any
    console.log(newCat);
    Cat.create(newCat).then((post) => {
        const jsonText = {'file_id': post.id};
        console.log(post.id);
        res.json(jsonText);
    });
});

app.get('/get-cats', (req, res) => {
    Cat.find().then((cats) => {
        res.send(cats);
    });
});


