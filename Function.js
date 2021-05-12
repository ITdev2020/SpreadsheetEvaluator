const startEvaluator = async () => {
  let response = await axios.get(`https://www.wix.com/_serverless/hiring-task-spreadsheet-evaluator/jobs?tag=is_less`)
  console.log(`getData${getData}`);
  ({data: getData} = response)

  processTask()
}

const processTask = () => {
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
    getData.jobs[jobNr].data = taskCopyForProcess
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


const ifCellHaveFormula = (taskCopyForProcess) => {
  let haveFormula = false

  taskCopyForProcess.forEach((row, rowIndex) => {
    taskCopyForProcess[rowIndex].forEach((cell) => {

      if (cell.formula) {
        haveFormula = true
        return
      }

    })
  })
  return haveFormula
}


const processJob = (taskCopyForProcess) => {

  for (let rowIndex in taskCopyForProcess) {
    for (let colIndex in taskCopyForProcess[rowIndex]) {

      if (Object.keys(taskCopyForProcess[rowIndex][colIndex])[0] == 'formula') {
        referenceReplaceWithValue(taskCopyForProcess)

        if (!ifCellHaveFormula(taskCopyForProcess)) {
          return
        }

        calc(taskCopyForProcess, rowIndex, colIndex)

      } // if  == 'formula'
    } // for collIndex
  } // for rowIndex
}


const referenceReplaceWithValue = (taskCopyForProcess) => {
  let cellHaveRef

  do {
    cellHaveRef = false
    taskCopyForProcess.forEach((row, rowIndex) => {
      taskCopyForProcess[rowIndex].forEach((cell, colIndex) => {

        let cellKey = Object.keys(cell)
        let ifReference = Object.keys(cell[cellKey])

        if (ifReference[0] == "reference") {
          let targetValue = a1ToRefValue(taskCopyForProcess, cell[cellKey].reference)
          taskCopyForProcess[rowIndex][colIndex] = targetValue
          cellHaveRef = true
        }

      })
    })
  }
  while (cellHaveRef == true)
}


const calc = (taskCopyForProcess, rowIndex, colIndex) => {

  let typeForm = Object.keys(taskCopyForProcess[rowIndex][colIndex].formula)

  let resultCell

  switch (typeForm[0]) {
    case 'sum':
      let sumArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.sum)
      let sumRes = 0

      sumArgs.forEach((sumElem) => {
        let targetValue = a1ToRefValue(taskCopyForProcess, sumElem.reference)
        sumRes += targetValue.value.number
      })

      resultCell = {'value': {[typeof sumRes]: sumRes}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'multiply':
      let mulArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.multiply)
      let mulRes = 1

      mulArgs.forEach((mulElem) => {
        let targetValue = a1ToRefValue(taskCopyForProcess, mulElem.reference)
        mulRes *= targetValue.value.number
      })

      resultCell = {'value': {[typeof mulRes]: mulRes}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'divide':
      let divArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.divide)

      let firstDivValue = a1ToRefValue(taskCopyForProcess, divArgs[0].reference)
      let secondDivValue = a1ToRefValue(taskCopyForProcess, divArgs[1].reference)
      let divResult = firstDivValue.value.number / secondDivValue.value.number

      resultCell = {'value': {[typeof divResult]: divResult}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'is_greater':
      let isGreArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.is_greater)

      let firstIsGreValue = a1ToRefValue(taskCopyForProcess, isGreArgs[0].reference)
      let secondIsGreValue = a1ToRefValue(taskCopyForProcess, isGreArgs[1].reference)
      let isGreResult = firstIsGreValue.value.number > secondIsGreValue.value.number

      resultCell = {'value': {[typeof isGreResult]: isGreResult}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'is_less':
      let isLesArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.is_less)

      let firstIsLesValue = a1ToRefValue(taskCopyForProcess, isLesArgs[0].reference)
      let secondIsLesValue = a1ToRefValue(taskCopyForProcess, isLesArgs[1].reference)
      let isLesResult = firstIsLesValue.value.number < secondIsLesValue.value.number

      resultCell = {'value': {[typeof isLesResult]: isLesResult}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'is_equal':
      let isEquArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.is_equal)

      let firstIsEquValue = a1ToRefValue(taskCopyForProcess, isEquArgs[0].reference).value[0]
      let secondIsEquValue = a1ToRefValue(taskCopyForProcess, isEquArgs[1].reference).value[0]
      let isEquResult = Object.is(firstIsEquValue, secondIsEquValue)

      resultCell = {'value': {[typeof isEquResult]: isEquResult}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'not':
      let notArgs = taskCopyForProcess[rowIndex][colIndex].formula.not

      let refValue = a1ToRefValue(taskCopyForProcess, notArgs.reference)
      let notResult = !Object.values(refValue.value)[0]

      resultCell = {'value': {[typeof notResult]: notResult}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'and':
      let andArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.and)
      let andArgValues = []

      andArgs.forEach((andElem) => {
        let refValue = a1ToRefValue(taskCopyForProcess, andElem.reference)
        let targetValue = Object.values(refValue.value)[0]
        andArgValues.push(targetValue)
      })

      // checking typeof arguments. Object.is - comparing two value. true if same.
      let checkAndTypeofFunc = (total, nextArg) => Object.is(typeof total, typeof nextArg)
      let checkAndTypeof = andArgValues.reduce(checkAndTypeofFunc)

      if (checkAndTypeof) {
        let andFunc = (total, nextArg) => total && nextArg
        let andResult = andArgValues.reduce(andFunc)
        resultCell = {'value': {[typeof andResult]: andResult}}
        taskCopyForProcess[rowIndex][colIndex] = resultCell
        return
      }
      resultCell = {'error': "type does not match"} // JavaScript return 'true && 1 = 1'
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'or':
      let orArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.or)
      let orArgValues = []

      orArgs.forEach((orElem) => {
        let refValue = a1ToRefValue(taskCopyForProcess, orElem.reference)
        let targetValue = Object.values(refValue.value)[0]
        orArgValues.push(targetValue)
      })

      // checking typeof arguments. Object.is - comparing two value. true if same.
      let checkOrTypeofFunc = (total, nextArg) => Object.is(typeof total, typeof nextArg)
      let checkOrTypeof = orArgValues.reduce(checkOrTypeofFunc)

      if (checkOrTypeof) {
        // if least one is true, no need check other
        let orFunc = (total, nextArg) => total || nextArg
        let orResult = orArgValues.reduce(orFunc)
        resultCell = {'value': {[typeof orResult]: orResult}}
        taskCopyForProcess[rowIndex][colIndex] = resultCell
        return
      }
      resultCell = {'error': "type does not match"} // JavaScript return 'true || 1 = true'
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'if':
      // Arguments:
      // 1 - condition (must be a boolean),
      // 2 - value if condition is true,
      // 3 - value if condition is false.
      let ifIsGreArgValues = (ifIsGreaterArg) => {
        let refIfIsGreValue = a1ToRefValue(taskCopyForProcess, ifIsGreaterArg.reference)
        let targetValue = Object.values(refIfIsGreValue.value)[0]
        return targetValue
      }

      // is_greater - arguments:
      let isGreaterFirstArg = taskCopyForProcess[0][2].formula.if[0].is_greater[0]
      let isGreaterSecondArg = taskCopyForProcess[0][2].formula.if[0].is_greater[1]
      let isIfIsGreResult = ifIsGreArgValues(isGreaterFirstArg) > ifIsGreArgValues(isGreaterSecondArg)
      resultCell = {'value': {[typeof isIfIsGreResult]: isIfIsGreResult}}
      taskCopyForProcess[0][2].formula.if[0] = resultCell

      // 1 - condition
      // arguments must be a boolean
      if (Object.keys(taskCopyForProcess[0][2].formula.if[0].value)[0] !== 'boolean') {
        taskCopyForProcess[0][2] = {'error': "condition. Must be a boolean."}
        return
      }

      if (taskCopyForProcess[0][2].formula.if[0].value.boolean) {
        // write truthy value
        // 2 - value if condition is true.
        let ifCondTrue = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.if)[1]
        let refValue = a1ToRefValue(taskCopyForProcess, ifCondTrue.reference)
        taskCopyForProcess[0][2] = refValue
      } else {
        // write falsy value
        // 3 - value if condition is false.
        let ifCondFalse = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.if)[2]
        let refValue = a1ToRefValue(taskCopyForProcess, ifCondFalse.reference)
        taskCopyForProcess[0][2] = refValue
      }
      return

    case 'concat':
      let concArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.concat)
      let concRes = []

      concArgs.forEach((concElem) => {
        concRes.push(Object.values(Object.values(concElem)[0])[0])
      })
      concRes = ''.concat(...concRes)
      resultCell = {'value': {'text': concRes}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    default:
  }
}



let a1ToRefValue = (taskCopyForProcess, arg) => {
  let argColumn = arg.charCodeAt(1) - 49 // A - ind
  let argRow = arg.charCodeAt(0) - 65 // 1 - ind
  let argValue = taskCopyForProcess[argColumn][argRow]

  return argValue
}
