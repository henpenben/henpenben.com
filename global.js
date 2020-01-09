"use strict";

window.addEventListener("load", init);

function init() {
    addNavBar();
}

function addNavBar() {
    qs("nav").innerHTML =
  `<ul>
    <li>
      <p>
        <a href="index.html">Home</a>
      </p>
    </li>
    <li>
      <p>
        <a href="about.html">About</a>
      </p>
    </li>
    <li>
      <p>
        <a href="minecraft.html">Minecraft</a>
      </p>
    </li>
  </ul>`
  let url = window.location.href.split("/");
  url = url[url.length - 1];
  qs(`nav a[href='${url}']`).classList.add("current");
  qs(`nav a[href='${url}']`).href = "";
}

function qs(selector) {
    return document.querySelector(selector);
}

