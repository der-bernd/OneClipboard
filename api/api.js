const fs = require("fs");

function isOptionMissing(data, needed, res) {
  return needed.some((key) => {
    if (typeof data[key] == "undefined") {
      res.writeHead(400);
      res.end("No field '" + key + "' supplied!");
      console.log('Error occurred: missing property "' + key + '" at ' + data);
      return true;
    }
    return false;
  });
}
function endWithJSON(res, JSON) {
  if (res.sent == true) return;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON);
}

module.exports = {
  GET: {
    "/ping": async (req, res, options) => {
      console.log("request");
      res.end("pong");
    },
    "/sqlTest": async (req, res, options) => {
      let result = await runQuery("SELECT * FROM `test`");
      res.end(JSON.stringify(result));
    },
  },
  POST: {
    "/apiTest": async (req, res, options) => {
      // leave this part
      endWithJSON(
        res,
        JSON.stringify({
          msg: "Hello, " + options.name,
        })
      );
    },
  },
};
