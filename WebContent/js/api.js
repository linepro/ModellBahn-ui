// module "api.js"
"use strict";

const setAuthorisation = (userName, password) => {
  localStorage.setItem("authorisation", "Basic " + btoa(userName + ":" + password));
};

const checkResponse = async (response) => {
  let clone = response.clone();
  if (200 <= response.status && response.status <= 202) {
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
  } else if (response.status === 204) {
    return { _embedded: [], _links: [] };
  } else if (response.status === 400 || response.status === 500) {
    let errorMessage = "";
    try {
      let jsonData = await response.json();
      errorMessage = jsonData.error + ": " + jsonData.message;
    } catch (error) {
      errorMessage = await clone.text();
    }
    console.log(errorMessage);
    throw new Error(errorMessage);
  } else {
    console.log(response.statusText);
    throw new Error(response.statusText);
  }
};

const headers = (contentType, accept) => {
  let httpHeaders = {
    "Accept": accept ? accept : "application/json, text/html, application/xhtml+xml, application/xml",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": localStorage.getItem("language"),
    "Cache-Control": "no-cache"
  };
  if (sessionStorage.getItem("authorisation")) {
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

const upload = async (endPoint, data, success, failure) => {
  let formData = new FormData();
  formData.append("file", data);
  await fetch(endPoint, {
    method: "PUT",
    headers: headers("multipart/form-data", "*/*"),
    body: formData
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error));
};
