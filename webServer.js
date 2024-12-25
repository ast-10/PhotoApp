/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const multer = require('multer');
const fs = require('fs');

const processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user || Object.keys(req.session.user).length === 0) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
  next();
};

app.use((req, res, next) => {
  if (req.path === "/admin/login" || req.path === "/admin/logout" || req.path==="/admin/session" || (req.method === "POST" && req.path==="/user")) {
    return next();
  }
  isAuthenticated(req, res, next);
})

app.get("/admin/session", (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ message: "No active session" });
  }
});

app.post("/admin/login", express.urlencoded({ extended: false }), async (req, res, next) => {
  const { login_name, password } = req.body;
  try {
    const user = await User.findOne({ login_name });
    console.log(user)
    if (!user || user.password !== password) {
      console.log("dont know")
      return res.status(400).json({ message: "Invalid login_name or password" });
    }
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.user = { _id: user._id, first_name: user.first_name, last_name: user.last_name };
      req.session.save((err) => {
        if (err) return next(err);
        res.status(200).json(req.session.user);
      });
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
});

app.post("/admin/logout", (req, res, next) => {
  req.session.user = null;
  req.session.save((err) => {
    if (err) return next(err);
    req.session.regenerate((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

app.post('/commentsOfPhoto/:photo_id', async (req, res) => {
  const photoId = req.params.photo_id;
  const { comment } = req.body;

  if (!req.session || !req.session.user) {
    return res.status(401).send('Unauthorized: User is not logged in');
  }

  if (!comment || comment.trim() === '') {
    return res.status(400).send('Comment cannot be empty');
  }

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return res.status(400).send('Invalid photo ID');
  }

  try {
    const photo = await Photo.findById(photoId).exec();

    if (!photo) {
      return res.status(400).send('Photo not found');
    }

    const newComment = {
      comment: comment,
      date_time: new Date(),
      user_id: req.session.user._id,
    };

    photo.comments.push(newComment);
    await photo.save();

    res.status(200).send('Comment added successfully');
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).send('Internal server error');
  }
});

app.post('/photos/new', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).send('Unauthorized: User is not logged in');
  }

  processFormBody(req, res, async (err) => {
    if (err || !req.file) {
      return res.status(400).send('No file received');
    }

    // Generate a unique filename
    const timestamp = new Date().valueOf();
    const filename = 'U' + timestamp + req.file.originalname;

    // Write the file to the images directory
    fs.writeFile(`./images/${filename}`, req.file.buffer, async (err) => {
      if (err) {
        console.error('Error saving file:', err);
        return res.status(500).send('Error saving file');
      }

      // Create a new Photo document
      const newPhoto = new Photo({
        file_name: filename,
        date_time: new Date(),
        user_id: req.session.user._id,
        comments: [],
      });

      try {
        await newPhoto.save();
        res.status(200).send('Photo uploaded successfully');
      } catch (error) {
        console.error('Error saving photo to database:', error);
        res.status(500).send('Error saving photo to database');
      }
    });
  });
});

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

      const info = await SchemaInfo.find({});
      if (info.length === 0) {
            // No SchemaInfo found - return 500 error
            return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch(err){
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }

  } else if (param === "counts") {
   // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.
   
    
const collections = [
  { name: "user", collection: User },
  { name: "photo", collection: Photo },
  { name: "schemaInfo", collection: SchemaInfo },
];

try {
  await Promise.all(
    collections.map(async (col) => {
      col.count = await col.collection.countDocuments({});
      return col;
    })
  );

  const obj = {};
  for (let i = 0; i < collections.length; i++) {
    obj[collections[i].name] = collections[i].count;
  }
  return response.end(JSON.stringify(obj));
} catch (err) {
  return response.status(500).send(JSON.stringify(err));
}
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", async function(request, response) {
  try {
    // Gettting id, first name and last name of all the users
    const users = await User.find({}, "_id first_name last_name");
    response.status(200).json(users);
  }catch(error) {
    response.status(500).send({ message: error.message });
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */

app.get("/user/:id", async function(request, response) {
  try{
    // Finding user details based on id parameter
    const user = await User.findById(request.params.id).select("_id first_name last_name location description occupation");
    if(!user){
      return response.status(400).send({ message: "User not found" });
    }
    return response.status(200).json(user);
  }
  catch(error){
    return response.status(400).send({ message: "Invalid user id" });
  }
});

app.post("/user", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send("All required fields (login_name, password, first_name, last_name) must be non-empty.");
  }
  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).send("login_name already exists. Please choose a different one.");
    }
    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });
    await newUser.save();
    res.status(200).json({ login_name });
  } catch (error) {
    res.status(500).send("Error registering user: " + error.message);
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */

app.get("/photosOfUser/:id", async function(request, response) {
  try {
    // Finding photos and other details based on id parameter
    const photos = await Photo.find({ user_id: request.params.id })
    .select("_id user_id comments file_name date_time")
    .lean();

    // Check to see if any photos are present
    if (photos.length === 0){
      console.log("Photos for user with _id:" + request.params.id + " not found.");
      return response.status(400).send({ message: "No photos found for this user" });
    }

    // Creating a list of userIds from all the comments
    const userIds = Array.from(new Set(photos.flatMap(photo => photo.comments.map(comment => comment.user_id.toString()))));

    const users = await User.find({ _id: {$in: userIds } }).select("_id first_name last_name");

    // Creating a user object with fields _id, first_name, last_name
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = {_id: user._id.toString(), first_name: user.first_name, last_name: user.last_name };
      return map;
    }, {});

    // Attaching the user object to comment object
    photos.forEach(photo => {
      photo.comments.forEach(comment => {
        const user = userMap[comment.user_id.toString()];
        if (user) {
          comment.user = user; 
        } else {
          comment.user = { _id: comment.user_id.toString(), first_name: "Unknown", last_name: "User" };
        }
        // Removing user_id from comment because it is additional 
        delete comment.user_id;
      });
    });
   
    return response.status(200).json(photos);
  }
  catch(error){
    return response.status(400).send({ message: "Invalid user id" });
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
