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
        if(!response.ok){
          reject(new Error(JSON.stringify({ status: response.status, statusText: response.statusText })));
        }
        return response.json();
      })
      .then((jsonData) => {
        resolve({ data:jsonData });
      })
      .catch((error) => {
        reject(new Error(JSON.stringify({ status: 500, statusText: error.message || "Unknown error" })));
      });
    
    // On Success return:
    // resolve({data: getResponseObject});
  });
}

export default fetchModel;
