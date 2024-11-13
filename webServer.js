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
const multer = require("multer");
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// const async = require("async");

const express = require("express");
const app = express();

app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

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

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));


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
    return response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", async function(request, response) {
  try {
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
/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */

app.get("/photosOfUser/:id", async function(request, response) {
  try {
    const photos = await Photo.find({ user_id: request.params.id })
    .select("_id user_id comments file_name date_time")
    .lean();

    if (photos.length === 0){
      console.log("Photos for user with _id:" + request.params.id + " not found.");
      return response.status(400).send({ message: "No photos found for this user" });
    }

    const userIds = Array.from(new Set(photos.flatMap(photo => photo.comments.map(comment => comment.user_id.toString()))));

    const users = await User.find({ _id: {$in: userIds } }).select("_id first_name last_name");

    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = {_id: user._id.toString(), first_name: user.first_name, last_name: user.last_name };
      return map;
    }, {});

    photos.forEach(photo => {
      photo.comments.forEach(comment => {
        const user = userMap[comment.user_id.toString()];
        if (user) {
          comment.user = user; 
        } else {
          comment.user = { _id: comment.user_id.toString(), first_name: "Unknown", last_name: "User" };
        }
        // Removing user_id
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
