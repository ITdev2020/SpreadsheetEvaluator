const startEvaluator = () => {
  getTask()
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

      let haveFormula = false
      ifCellHaveFormula(taskCopyForProcess, haveFormula) ? processJob(taskCopyForProcess) : ''
    } else {
      console.log(`job not include data`)
    }
    // if taskCopyForProcess = not changed, then not need assignment
    getData.jobs[jobNr].data = taskCopyForProcess
    createDiv(getData.jobs[jobNr])
    createDiv('----------------------------------------------------')
  })
    setData.results = getData.jobs
    console.log(JSON.stringify(setData))
  setTask(setData)
}

const setAllData = (data) => {
  getData = data
}

const ifCellHaveFormula = (taskCopyForProcess, haveFormula) => {

  taskCopyForProcess.forEach((row, rowIndex) => {
    taskCopyForProcess[rowIndex].forEach((cell) => {

      let ifFormula = Object.keys(cell)

      if (ifFormula[0] == 'formula') {
        haveFormula = true
      }

    })
  })
  return haveFormula
}


const processJob = (taskCopyForProcess) => {

  for (rowIndex in taskCopyForProcess) {
    for (colIndex in taskCopyForProcess[rowIndex]) {
      if (Object.keys(taskCopyForProcess[rowIndex][colIndex])[0] == 'formula') {
        referenceReplaceWithValue(taskCopyForProcess)

        let haveFormula = false
        if (!ifCellHaveFormula(taskCopyForProcess, haveFormula)) {
          return
        }

        calc(taskCopyForProcess)

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
          let refVal = cell.formula.reference
          let indRow = refVal.charCodeAt(1) - 49
          let indCol = refVal.charCodeAt(0) - 65
          taskCopyForProcess[rowIndex][colIndex] = taskCopyForProcess[indRow][indCol]
          cellHaveRef = true
        }

      })
    })
  }
  while (cellHaveRef == true)
}


const calc = (taskCopyForProcess) => {

  let typeForm = Object.keys(taskCopyForProcess[rowIndex][colIndex].formula)

  let resultCell

  switch (typeForm[0]) {
    case 'sum':
      let sumArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.sum)
      let sumRes = 0
      sumArgs.forEach((sumElem) => {
        let refValue = sumElem.reference
        let indRow = refValue.charCodeAt(1) - 49
        let indCol = refValue.charCodeAt(0) - 65
        let targetValue = taskCopyForProcess[indRow][indCol]
        sumRes += targetValue.value.number
      })
      resultCell = {'value': {[typeof sumRes]: sumRes}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'multiply':
      let mulArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.multiply)
      let mulRes = 1
      mulArgs.forEach((mulElem) => {
        let refValue = mulElem.reference
        let indRow = refValue.charCodeAt(1) - 49
        let indCol = refValue.charCodeAt(0) - 65
        let targetValue = taskCopyForProcess[indRow][indCol]
        mulRes *= targetValue.value.number
      })
      resultCell = {'value': {[typeof mulRes]: mulRes}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'divide':
      let divArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.divide)
      let divArgValues = []
      divArgs.forEach((divElem) => {
        let refValue = divElem.reference
        let indRow = refValue.charCodeAt(1) - 49
        let indCol = refValue.charCodeAt(0) - 65
        let targetValue = taskCopyForProcess[indRow][indCol]
        divArgValues.push(targetValue.value.number)
      })

      // !!!!!!!!! - Maybe must 'Acceptable error: 10-7'  !!!!!!!!!
      let divFunc = (total, nextArg) => total / nextArg
      let divResult = divArgValues.reduce(divFunc)
      resultCell = {'value': {[typeof divResult]: divResult}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'is_greater':
      let isGreArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.is_greater)
      let isGreArgValues = []
      isGreArgs.forEach((isGreElem) => {
        let refValue = isGreElem.reference
        let indRow = refValue.charCodeAt(1) - 49
        let indCol = refValue.charCodeAt(0) - 65
        let targetValue = taskCopyForProcess[indRow][indCol]
        isGreArgValues.push(targetValue.value.number)
      })
      let isGreFunc = (total, nextArg) => total > nextArg
      let isGreResult = isGreArgValues.reduce(isGreFunc)
      resultCell = {'value': {[typeof isGreResult]: isGreResult}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'is_equal':
      let isEquArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.is_equal)
      let isEquArgValues = []
      isEquArgs.forEach((isEquElem) => {
        let refValue = isEquElem.reference
        let indRow = refValue.charCodeAt(1) - 49
        let indCol = refValue.charCodeAt(0) - 65
        let targetValue = taskCopyForProcess[indRow][indCol]
        isEquArgValues.push(targetValue.value.number)
      })
      let isEquFunc = (total, nextArg) => Object.is(total, nextArg)
      let isEquResult = isEquArgValues.reduce(isEquFunc)
      resultCell = {'value': {[typeof isEquResult]: isEquResult}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'not':
      let isNotArgs = taskCopyForProcess[rowIndex][colIndex].formula.not
      let refValue = isNotArgs.reference
      let indRow = refValue.charCodeAt(1) - 49
      let indCol = refValue.charCodeAt(0) - 65
      let targetValue = Object.values(taskCopyForProcess[indRow][indCol].value)

      let isNotResult = !targetValue[0]
      resultCell = {'value': {[typeof isNotResult]: isNotResult}}
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'and':
      let isAndArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.and)
      let isAndArgValues = []
      isAndArgs.forEach((isAndElem) => {
        let refValue = isAndElem.reference
        let indRow = refValue.charCodeAt(1) - 49
        let indCol = refValue.charCodeAt(0) - 65
        let targetValue = Object.values(taskCopyForProcess[indRow][indCol].value)
        isAndArgValues.push(targetValue[0])
      })
      // checking typeof arguments. Object.is - comparing two value. true if same.
      let checkAndTypeofFunc = (total, nextArg) => Object.is(typeof total, typeof nextArg)
      let checkAndTypeof = isAndArgValues.reduce(checkAndTypeofFunc)

      if (checkAndTypeof) {
        let isAndFunc = (total, nextArg) => total && nextArg
        let isAndResult = isAndArgValues.reduce(isAndFunc)
        resultCell = {'value': {[typeof isAndResult]: isAndResult}}
        taskCopyForProcess[rowIndex][colIndex] = resultCell
        return
      }
      resultCell = {'error': "type does not match"} // JavaScript return 'true && 1 = 1'
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'or':
      let isOrArgs = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.or)
      let isOrArgValues = []
      isOrArgs.forEach((isOrElem) => {
        let refValue = isOrElem.reference
        let indRow = refValue.charCodeAt(1) - 49
        let indCol = refValue.charCodeAt(0) - 65
        let targetValue = Object.values(taskCopyForProcess[indRow][indCol].value)
        isOrArgValues.push(targetValue[0])
      })
      // checking typeof arguments. Object.is - comparing two value. true if same.
      let checkOrTypeofFunc = (total, nextArg) => Object.is(typeof total, typeof nextArg)
      let checkOrTypeof = isOrArgValues.reduce(checkOrTypeofFunc)

      if (checkOrTypeof) {
        // if least one is true, no need check other
        let isOrFunc = (total, nextArg) => total || nextArg
        let isOrResult = isOrArgValues.reduce(isOrFunc)
        resultCell = {'value': {[typeof isOrResult]: isOrResult}}
        taskCopyForProcess[rowIndex][colIndex] = resultCell
        return
      }
      resultCell = {'error': "type does not match"} // JavaScript return 'true || 1 = true'
      taskCopyForProcess[rowIndex][colIndex] = resultCell
      return

    case 'if':
      let isIfArgValues = []

      let refToValue = (elem) => {
        let refValue = elem.reference
        let indRow = refValue.charCodeAt(1) - 49
        let indCol = refValue.charCodeAt(0) - 65
        let targetValue = Object.values(taskCopyForProcess[indRow][indCol].value)
        isIfArgValues.push(targetValue[0])
      }

      let isGreater = (isIfArgValues) => {
        let isGreFunc = (total, nextArg) => total > nextArg
        let isGreResult = isIfArgValues.reduce(isGreFunc)
        resultCell = {'value': {[typeof isGreResult]: isGreResult}}
        taskCopyForProcess[0][2].formula.if[0] = resultCell
        // return
      }

      // is_greater - arguments:
      let isGreaterFirstArg = taskCopyForProcess[0][2].formula.if[0].is_greater[0]
      refToValue(isGreaterFirstArg)
      let isGreaterSecondArg = taskCopyForProcess[0][2].formula.if[0].is_greater[1]
      refToValue(isGreaterSecondArg)
      isGreater(isIfArgValues)

      if (Object.keys(taskCopyForProcess[0][2].formula.if[0].value)[0] !== 'boolean') {
        taskCopyForProcess[0][2] = {'error': "condition. Must be a boolean."}
        return
      }

      let writeStatm = (ifCond) => {
        let refValue = ifCond.reference
        let indRow = refValue.charCodeAt(1) - 49
        let indCol = refValue.charCodeAt(0) - 65
        let targetValue = taskCopyForProcess[indRow][indCol]
        taskCopyForProcess[0][2] = targetValue

        // return
      }


      if (taskCopyForProcess[0][2].formula.if[0].value.boolean) {
        // write truthy value
        // 2 - value if condition is true.
        let ifCondTrue = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.if)[1]
        writeStatm(ifCondTrue)
      } else {
        // write falsy value
        // 3 - value if condition is false.
        let ifCondFalse = Object.values(taskCopyForProcess[rowIndex][colIndex].formula.if)[2]
        writeStatm(ifCondFalse)
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
  // return
}
