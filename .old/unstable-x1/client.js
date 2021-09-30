function pageLoad() {
  document.querySelector("body > div > div:first-child").innerText = server;
  alert("Polyphony is currently being redesigned to incorporate more features.");
}

var socket, clients, muted, server = location.href;
document.body.onload = pageLoad;