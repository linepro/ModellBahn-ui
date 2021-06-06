// module "api.js"
"use strict";

const apiUrl = (path) =>
  window.location.origin.replace(/\/$/, "") + "/api/" + path;

const fileUrl = (path) =>
  window.location.origin.replace(/\/$/, "") + "/modellbahn-ui/" + path;

const setAuthorisation = (userName, password) =>
  sessionStorage.setItem("authorisation", "Basic " + btoa(userName + ":" + password));

class ApiException {
  constructor(response) {
    this.status =  response.status;
    this.type =  response.type;
    this.url =  response.url;
    this.body = response.body;
    this.redirect =  response.redirect;
  }
}

const checkResponse = async (response) => {
  if (response.ok) {
    if (response.redirected) {
        window.location.href = response.redirect();
    } else {
      let contentType = response.headers.get("content-type");
      if (contentType) {
        if (contentType.includes("json")) {
          return response.json();
        } else if (contentType.includes("text")) {
          return response.text();
        }
        return response.blob();
      }
      return { _embedded: [], _links: [] };
    }
  } else if (response.status === 404) {
    return { _embedded: [], _links: [] };
  } else {
    throw new ApiException(response);
  }
};

const sessionId = () => document.cookie.match(/JSESSIONID=[^;]+/);

const headers = (contentType, accept = "application/json, text/html, application/xhtml+xml, application/xml") => {
  let httpHeaders = {
    "Accept": accept,
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": localStorage.getItem("language"),
    "Cache-Control": "no-cache"
  };
  let jsessionId = sessionId();
  if (jsessionId) {
    httpHeaders["Cookie"] = jsessionId;
  } else if (sessionStorage.getItem("authorisation")) {
    httpHeaders["Authorization"] = sessionStorage.getItem("authorisation");
  }
  if (contentType) {
    httpHeaders["Content-Type"] = contentType;
  }
  return httpHeaders;
};

const getRest = async (endPoint, success, failure) => {
  await fetch(endPoint, {
    method: "GET",
    headers: headers(undefined)
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error));
};

const postRest = async (endPoint, data, success, failure) => {
  await fetch(endPoint, {
    method: "POST",
    headers: headers("application/json"),
    body: JSON.stringify(data)
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error));
};

const putRest = async (endPoint, data, success, failure) => {
  await fetch(endPoint, {
    method: "PUT",
    headers: headers("application/json"),
    body: JSON.stringify(data)
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error));
};

const setRest = async (endPoint, fieldName, value, success, failure) => {
  await fetch(endPoint + "?" + fieldName + "=" + value, {
    method: "PUT",
    headers: headers()
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error));
};

const deleteRest = async (endPoint, success, failure) => {
  await fetch(endPoint, {
    method: "DELETE",
    headers: headers()
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error));
};

const download = async (endPoint, success, failure) => {
  await fetch(endPoint, {
    method: "GET",
    headers: headers(undefined, "*/*")
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error));
};

const upload = async (endPoint, fieldName, fileData, fileName, success, failure) => {
  let formData = new FormData();
  formData.append(fieldName, fileData, fileName);
  await fetch(endPoint, {
    method: "PUT",
    headers: headers(undefined, "*/*"),
    body: formData
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error));
};
