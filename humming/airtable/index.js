"use strict";
(function() {
  const AT = {// AirTable
    "key": "api_key=keyly9X0UwEpAQw1h",
    "bases": [{// could be more bases in the future, but I only made one for now
      "name": "UW-creative-project-3",
      "id": "appLWtxL7raprpB05",
      "tables": [{// again, future potential for more tables
        "name": "table-1",
        "id": "tblpFwQUY8NHFqc9e",
        "fields": {
          "id": "Campaign%20ID",
          "name": "Name",
          "imps": "Impressions",
          "clicks": "Clicks",
          "ctr": "CTR"
        }
      }]
    }],
    "url": {
      "endpoint": "https://api.airtable.com/v0/",
      "count": "maxRecords=",
      "field": "fields%5B%5D=", // string array, if appended only named fields will be returned
      "sort": {// example: url1 + type[0] + url2 + [fields].id | direction
        "url1": "sort%5B0%5D%5B",
        "url2": "%5D=",
        "type": [
          "field",
          "direction"
        ],
        "directions": {
          "ascending": "asc",
          "descending": "desc"
        }
      }
    }
  };

  const BASE_NUM = 0; // just statically using one base for now
  const TABLE_NUM = 0; // same as above

  window.addEventListener("load", init);

  /**
   * initial function
   * adds listener to buttons
   */
  function init() {
    document.querySelector("#pull-btn").addEventListener("click", checkMenu);
    document.querySelector("#send-btn").addEventListener("click", addRecordRead);
  }

  /**
   * checks to see you have selected a field to sort by before polling the API
   */
  function checkMenu() {
    let warn = document.querySelector("#warning");
    if (document.querySelector("select").value !== "") {
      pullData();
      if (warn !== null) {
        warn.classList.add("hidden");
      }
    } else if (warn === null) {
      let pickOption = document.createElement("p");
      pickOption.textContent = "please choose a field!";
      pickOption.id = "warning";
      document.querySelector("#sort").appendChild(pickOption);
    }
  }

  /**
   * pulls data from the AirTable database
   * pulls sorted smallest to largest by campaign ID
   */
  function pullData() {
    let url = buildURL();

    fetch(url)
      .then(checkStatus)
      .then(response => response.json())
      .then(displayData)
      .catch(handleError);

    let dispBtn = document.querySelector("#display-btn");
    dispBtn.addEventListener("click", showData);
    setTimeout(() => {
      dispBtn.disabled = false;
      document.querySelector("#send-btn").disabled = false;
    }, 500); // half a second
  }

  /**
   * determines parameters and builds the api url accordingly
   * @return {string} the url to fetch
   */
  function buildURL() {
    // base url, always needs to hit the endpoint, database, and table, as well as use key
    let url = AT.url["endpoint"] + AT.bases[BASE_NUM]["id"] + "/" +
              AT.bases[BASE_NUM].tables[TABLE_NUM]["id"] + "?" + AT["key"];

    let recordCount = document.querySelector("#count").value;
    if (recordCount !== "" || parseInt(recordCount) > 0) {
      url += "&" + AT.url["count"] + recordCount;
    }

    let sortField = document.querySelector("select").value;
    let sortURL = AT.url.sort["url1"] + AT.url.sort.type[0] + AT.url.sort["url2"] +
                  AT.bases[BASE_NUM].tables[TABLE_NUM].fields[sortField];

    let sortType;
    if (document.querySelector("#asc").checked) {
      sortType = "ascending";
    } else {
      sortType = "descending";
    }
    sortURL += "&" + AT.url.sort["url1"] + AT.url.sort.type[1] + AT.url.sort["url2"] +
               AT.url.sort.directions[sortType];

    url += "&" + sortURL;
    return url;
  }

  /**
   * displays data from pullData() api call onto the page
   * @param {json} json - the data to display
   */
  function displayData(json) {
    console.log(json);
    let table = document.querySelector("table");
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
    let tableHead = table.createTHead();
    let headerRow = tableHead.insertRow();
    for (let key of Object.keys(json.records[0].fields)) {
      let columnHeader = document.createElement("th");
      let text = document.createTextNode(key);
      columnHeader.appendChild(text);
      headerRow.appendChild(columnHeader);
    }
    for (let i = 0; i < json.records.length; i++) {
      let row = table.insertRow();
      for (let key of Object.keys(json.records[i].fields)) {
        let cell = row.insertCell();
        let text = document.createTextNode(json.records[i].fields[key]);
        if (key === "CTR") {
          text.textContent = text.textContent * 100; // percentage modifier
          text.textContent = text.textContent + "%";
        }
        cell.appendChild(text);
      }
    }
  }

  /**
   * makes the table show up when the "display data" button is clicked
   */
  function showData() {
    document.querySelector("#table").classList.remove("hidden");
    document.querySelector("#display-btn").disabled = true;
  }

  /**
   * handles errors in api call
   * based on CSE154 example code (basically copied)
   * @param {object} data - the api's return
   * @returns {object} same as above, if no error
   */
  function checkStatus(data) {
    if (!data.ok) {
      throw Error("error: " + data.statusText);
    }
    return data;
  }

  /**
   * adds a record to the base!
   * reads inputs off of the page
   * @param {int} id - an id number
   * @param {string} name - a human readable name
   * @param {int} imps - a number of impressions
   * @param {int} clicks - a number of clicks
   * this fetch was made using a curl --> fetch generator
   * I couldn't get it working any other way so there's a ton of 'magic'
   * eventually I'll figure it out
   */
  function addRecordCall(id, name, imps, clicks) {
    fetch("https://api.airtable.com/v0/appLWtxL7raprpB05/tblpFwQUY8NHFqc9e", {
      body: "{\n  \"fields\": {\n    \"Campaign ID\": " + id + ",\n    \"Name\": \"" + name +
            "\",\n    \"Impressions\": " + imps + ",\n    \"Clicks\": " + clicks +
            "\n  },\n  \"typecast\": true\n}",
      headers: {
        "Authorization": "Bearer keyly9X0UwEpAQw1h",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
  }

  /**
   * reads inputs off of the page for addRecordCall
   */
  function addRecordRead() {
    let id = Math.floor(Math.random() * 1000000000); // making this unique would be effort
    // it is going to be pulled from somewhere else anyways in the future
    let name = document.querySelector("#name").value;
    let imps = document.querySelector("#impressions").value;
    let clicks = document.querySelector("#clicks").value;
    addRecordCall(id, name, imps, clicks);
    setTimeout(pullData, 500); // half a second again
  }

  /**
   * sends errors to console when they happen
   * @param {string} error the error
   */
  function handleError(error) {
    let err = document.createElement("p");
    err.textContent = error;
    document.querySelector("#error").appendChild(err);
  }

})();
