const fs = require("fs"),
  filepath = "data.json";

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

function sortAndReturnWithFileContent(res, content, deviceId) {
  content.sort((a, b) => {
    var check1 = +(a.id == deviceId),
      check2 = +(b.id == deviceId);
    return check2 - check1; // somehow < operator didn't work
  });
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      data: content,
    })
  );
}

async function readFromFile() {
  return new Promise((res, rej) => {
    fs.readFile(filepath, (err, data) => {
      data = JSON.parse(data);
      try {
        data = Array.from(data); // just to verify array
      } catch (e) {
        console.log("Could not convert to array: \n" + e);
        rej(e);
      }
      res(data);
    });
  });
}

module.exports = {
  GET: {
    "/ping": async (req, res, options) => {
      console.log("request");
      res.end("pong");
    },
  },
  POST: {
    "/apiTest": async (req, res, options) => {
      if (!isOptionMissing(options, ["name"], res)) {
        sortAndReturnWithFileContent(
          res,
          JSON.stringify({
            msg: "Hello, " + options.name,
          })
        );
      }
    },

    "/signInOrRegister": async (req, res, options) => {
      if (!isOptionMissing(options, ["id", "deviceData"], res)) {
        var fileContent = await readFromFile();
        if (fileContent.find((e) => e.id == options.id) === undefined) {
          var initDeviceObj = {
            id: options.id,
            clipboard: [],
            ...options.deviceData,
          };
          fileContent.push(initDeviceObj);
          fs.writeFile(
            filepath,
            JSON.stringify(fileContent),
            (err) => console.log
          );
        }
        sortAndReturnWithFileContent(res, fileContent, options.id);
      }
    },

    "/upload": async (req, res, options) => {
      if (!isOptionMissing(options, ["id", "data"], res)) {
        var fileContent = await readFromFile(),
          deviceClipboard = fileContent.find(
            (d) => d.id == options.id
          ).clipboard;
        if (!deviceClipboard.includes(options.data)) {
          deviceClipboard.unshift(options.data);
          while (deviceClipboard.length > 3) deviceClipboard.pop();
        }
        fs.writeFile(
          filepath,
          JSON.stringify(fileContent),
          (err) => console.log
        );

        sortAndReturnWithFileContent(res, fileContent, options.id);
      }
    },

    "/refresh": async (req, res, options) => {
      if (!isOptionMissing(options, ["id"], res)) {
        var fileContent = await readFromFile();

        sortAndReturnWithFileContent(res, fileContent, options.id);
      }
    },
  },
};
