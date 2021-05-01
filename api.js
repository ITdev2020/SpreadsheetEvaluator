const getTask = () => {
axios
  .get(`https://www.wix.com/_serverless/hiring-task-spreadsheet-evaluator/jobs?tag=is_less`)
  // .get(`https://www.wix.com/_serverless/hiring-task-spreadsheet-evaluator/jobs`)
  .then(response => {
    setAllData(response.data)
  })
  .then(response => {
    processTask()
  })
  .catch((err) => {
    console.log(err)
  })
}

const setTask = (setData) => {
  axios
    .post('https://www.wix.com/_serverless/hiring-task-spreadsheet-evaluator/submit/eyJ0YWdzIjpbImlzX2xlc3MiXX0', setData)
    // .post('https://www.wix.com/_serverless/hiring-task-spreadsheet-evaluator/submit/eyJ0YWdzIjpbXX0', setData)
    .then(response => {
      console.log(response.data)
    })
}