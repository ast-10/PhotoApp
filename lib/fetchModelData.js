/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    console.log(url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          const error = new Error(response.statusText);
          error.status = response.status;
          reject(error);  // Reject with an Error object
        }
        return response.json();
      })
      .then((jsonData) => {
        resolve({ data:jsonData });
      })
      .catch((error) => {
        const err = new Error(error.message || "Unknown error");
        err.status = 500;
        reject(err); 
      });
  });
}

export default fetchModel;
