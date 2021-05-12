const startEvaluator = async () => {
  let response = await axios.get(`https://www.wix.com/_serverless/hiring-task-spreadsheet-evaluator/jobs?tag=is_less`)
  console.log(`getData${getData}`);
  ({data: getData} = response)

  // for each job, get task
  getData.jobs.forEach((job, jobNr) => {
    createDiv(getData.jobs[jobNr])

    let task = job.data

    //create copy of task
    let taskCopyForProcess = JSON.parse(JSON.stringify(task))

    // check if job task is exist
    if (task.length !== 0) {
      ifCellHaveFormula(taskCopyForProcess) ? processJob(taskCopyForProcess) : ''
    } else {
      console.log(`job not include data`)
    }

    // if taskCopyForProcess = not changed, then not need assignment
    JSON.stringify(task) !== JSON.stringify(taskCopyForProcess) ?
      getData.jobs[jobNr].data = taskCopyForProcess :
      ''
    createDiv(getData.jobs[jobNr])
    createDiv('----------------------------------------------------')
  })

  setData.results = getData.jobs
  axios
    .post('https://www.wix.com/_serverless/hiring-task-spreadsheet-evaluator/submit/eyJ0YWdzIjpbImlzX2xlc3MiXX0', setData)
    // .post('https://www.wix.com/_serverless/hiring-task-spreadsheet-evaluator/submit/eyJ0YWdzIjpbXX0', setData)
    .then(response => {
      console.log(response.data)
    })
}
