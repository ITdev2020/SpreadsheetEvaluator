const createDiv = (nextJob) => {
  let createElem = document.createElement("div")
  document.body.querySelector('#root').insertAdjacentElement("beforeend", createElem)
  // :nth-last-child(1) - first element of it's parent from the last child
  let nthDiv = document.querySelector("div:nth-last-child(1)")
  nthDiv.innerHTML = JSON.stringify(nextJob)
}
