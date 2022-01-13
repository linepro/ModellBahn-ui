// module "api.js"
"use strict";

const apiUrl = (path) =>
  window.location.origin.replace(/\/$/, "") + "/api/" + path;

const fileUrl = (path) =>
  window.location.origin.replace(/\/$/, "") + "/modellbahn-ui/" + path;

const setAuthorisation = (userName, password) =>
  sessionStorage.setItem("authorisation", "Basic " + btoa(userName + ":" + password));

class ApiException {
  constructor(response, payload) {
    this.status = response.status;
    this.type = response.type;
    this.url = response.url;
    this.payload = payload;
    this.redirect = response.redirect;
  }
  
  toString() {
    return this.payload.error + ": " + this.payload.message;
  }
}

const getContent = async (response) => {
  try {
    let contentType = response.headers.get("content-type");
    if (contentType) {
      if (contentType.includes("json")) {
        return response.json();
      } else if (contentType.includes("text")) {
        return response.text();
      }
      return response.blob();
    }
  } catch {
    // Non readable content
  }
  return { _embedded: [], _links: [] };
};

const checkResponse = async (response) => {
  if (response.redirected) {
    window.location.href = response.redirect();
  } else if (response.ok || response.status === 404) {
    return getContent(response);
  } else {
    let payload = await getContent(response);
    throw new ApiException(response, payload);
  }
};

const sessionId = () => document.cookie.match(/JSESSIONID=[^;]+/);

const waitCursor = () => {
  let cursor = document.activeElement.style.cursor;
  document.activeElement.style.cursor = "wait";
  return cursor;
};

const doneCursor = (cursor) => {
  document.activeElement.style.cursor = cursor;
};

const headers = (contentType, accept = "application/json, application/hal+json") => {
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
  let cursor = waitCursor();
  await fetch(endPoint, {
    method: "GET",
    headers: headers(undefined)
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error))
  .finally(() => doneCursor(cursor));
};

const postRest = async (endPoint, data, success, failure) => {
  let cursor = waitCursor();
  await fetch(endPoint, {
    method: "POST",
    headers: headers("application/json"),
    body: JSON.stringify(data)
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error))
  .finally(() => doneCursor(cursor));
};

const putRest = async (endPoint, data, success, failure) => {
  let cursor = waitCursor();
  await fetch(endPoint, {
    method: "PUT",
    headers: headers("application/json"),
    body: JSON.stringify(data)
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error))
  .finally(() => doneCursor(cursor));
};

const setRest = async (endPoint, fieldName, value, success, failure) => {
  let cursor = waitCursor();
  await fetch(endPoint + "?" + fieldName + "=" + value, {
    method: "PUT",
    headers: headers()
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error))
  .finally(() => doneCursor(cursor));
};

const deleteRest = async (endPoint, success, failure) => {
  let cursor = waitCursor();
  await fetch(endPoint, {
    method: "DELETE",
    headers: headers()
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error))
  .finally(() => doneCursor(cursor));
};

const download = async (endPoint, success, failure) => {
  let cursor = waitCursor();
  await fetch(endPoint, {
    method: "GET",
    headers: headers(undefined)
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error))
  .finally(() => doneCursor(cursor));
};

const upload = async (endPoint, fieldName, fileData, fileName, success, failure, method = "PUT") => {
  let cursor = waitCursor();
  let formData = new FormData();
  formData.append(fieldName, fileData, fileName);
  await fetch(endPoint, {
    method: method,
    headers: headers(undefined),
    body: formData
  })
  .then(response => checkResponse(response))
  .then(jsonData => success(jsonData))
  .catch(error => failure(error))
  .finally(() => doneCursor(cursor));
};
