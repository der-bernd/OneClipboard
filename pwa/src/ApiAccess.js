export const ApiBasePath = process.env.DEV
  ? "http://" + window.location.hostname
  : window.location.hostname.startsWith("dev")
  ? "https://dev.api.studicar.mfinn.de"
  : "https://api.studicar.mfinn.de";

export function sendApiRequest(
  action,
  options,
  successCallback,
  errorCallback
) {
  options = JSON.parse(JSON.stringify(options)); //deep copy. Somehow {...options} and Object.assign({}, options) did both not work;
  if (!(action.path && action.method))
    errorCallback(
      new Error(
        "Invalid action supplied. Use predefined or make sure that it contains a path and a method."
      )
    );

  var axios = require("axios");

  if (action.method === "GET") {
    axios
      .get(ApiBasePath + action.path, { params: options })
      .then(response => successCallback(response.data, response))
      .catch(err => errorCallback(err.response));
  } else if (action.method === "POST") {
    axios
      .post(ApiBasePath + action.path, options)
      .then(response => successCallback(response.data, response))
      .catch(err => errorCallback(err.response));
  }
}

export const SQL_TEST_READ = {
  path: "/sqlTest",
  method: "GET"
};

export const PING = {
  path: "/ping",
  method: "GET"
};

export const TEST_API = {
  path: "/apiTest",
  method: "POST"
};

export const SIGN_IN_OR_REGISTER = {
  path: "/signInOrRegister",
  method: "POST"
};

export const UPLOAD = {
  path: "/upload",
  method: "POST"
};

export const REFRESH = {
  path: "/refresh",
  method: "POST"
};
