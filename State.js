let getData
let setData = {
  "email": "pijusn@wix.com",
  // "email": "igor.talaiko.2020@gmail.com",
  "results": []
}


const ifCellsHaveFormula = (taskCopyForProcess) => {
  let haveFormula = false

  taskCopyForProcess.forEach((row, rowIndex) => {
    taskCopyForProcess[rowIndex].forEach((cell) => {
      if (cell.formula) {
        return haveFormula = true
      }
    })
  })

  return haveFormula
}


const processJob = (taskCopyForProcess) => {

  for (let rowIndex in taskCopyForProcess) {
    for (let colIndex in taskCopyForProcess[rowIndex]) {
      if (Object.keys(taskCopyForProcess[rowIndex][colIndex])[0] == 'formula') {
        let operator = Object.keys(taskCopyForProcess[rowIndex][colIndex].formula)[0]
        let arguments = taskCopyForProcess[rowIndex][colIndex].formula[operator]
        taskCopyForProcess[rowIndex][colIndex] = operators[operator](taskCopyForProcess, arguments)
      } // if  == 'formula'
    } // for collIndex
  } // for rowIndex

}


let a1ToRefValue = (taskCopyForProcess, arg) => {
  let argColumn = arg.charCodeAt(1) - 49 // A - index
  let argRow = arg.charCodeAt(0) - 65 // 1 - index
  return taskCopyForProcess[argColumn][argRow]
}


// ========= operators ======
const operators = {
  reference: function (taskCopyForProcess, arg) {
    console.log('operator is reference')
    let result = a1ToRefValue(taskCopyForProcess, arg)

    if (Object.keys(result)[0] == 'formula') {

      let formulaOperator = Object.keys(result.formula)[0]
      let newResult = result
      do {
        formulaOperator = Object.keys(newResult.formula)[0]
        let arg = newResult.formula[formulaOperator]
        newResult = this[formulaOperator](taskCopyForProcess, arg)
      }
      while (Object.keys(newResult)[0] == 'formula')
      return newResult
    }

    return result
  },

  sum: function (taskCopyForProcess, sumArgs) {
    console.log('operator is sum')
    let sumRes = 0
    sumArgs.forEach((sumElem) => {
      let targetValue = a1ToRefValue(taskCopyForProcess, sumElem.reference)
      sumRes += targetValue.value.number
    })
    return {'value': {[typeof sumRes]: sumRes}}
  },

  multiply: function (taskCopyForProcess, mulArgs) {
    console.log('operator is multiply')
    let mulRes = 1
    mulArgs.forEach((mulArg) => {
      let targetValue = a1ToRefValue(taskCopyForProcess, mulArg.reference)
      mulRes *= targetValue.value.number
    })
    return {'value': {[typeof mulRes]: mulRes}}
  },

  divide: function (taskCopyForProcess, divArgs) {
    console.log('operator is divide')
    let firstDivValue = a1ToRefValue(taskCopyForProcess, divArgs[0].reference)
    let secondDivValue = a1ToRefValue(taskCopyForProcess, divArgs[1].reference)
    let divResult = firstDivValue.value.number / secondDivValue.value.number
    return {'value': {[typeof divResult]: divResult}}
  },

  is_greater: function (taskCopyForProcess, isGreArgs) {
    console.log('operator is is_greater')
    let firstIsGreValue = a1ToRefValue(taskCopyForProcess, isGreArgs[0].reference)
    let secondIsGreValue = a1ToRefValue(taskCopyForProcess, isGreArgs[1].reference)
    let isGreResult = firstIsGreValue.value.number > secondIsGreValue.value.number
    return {'value': {[typeof isGreResult]: isGreResult}}
  },

  is_less: function (taskCopyForProcess, isLesArgs) {
    console.log('operator is is_less')
    let firstIsLesValue = a1ToRefValue(taskCopyForProcess, isLesArgs[0].reference)
    let secondIsLesValue = a1ToRefValue(taskCopyForProcess, isLesArgs[1].reference)
    let isLesResult = firstIsLesValue.value.number < secondIsLesValue.value.number
    return {'value': {[typeof isLesResult]: isLesResult}}
  },

  is_equal: function (taskCopyForProcess, isEquArgs) {
    console.log('operator is is_equal')
    let firstIsEquValue = a1ToRefValue(taskCopyForProcess, isEquArgs[0].reference).value[0]
    let secondIsEquValue = a1ToRefValue(taskCopyForProcess, isEquArgs[1].reference).value[0]
    let isEquResult = Object.is(firstIsEquValue, secondIsEquValue)
    return {'value': {[typeof isEquResult]: isEquResult}}
  },

  not: function (taskCopyForProcess, notArgs) {
    console.log('operator is not')
    let refValue = a1ToRefValue(taskCopyForProcess, notArgs.reference)
    let notResult = !Object.values(refValue.value)[0]
    return {'value': {[typeof notResult]: notResult}}
  },

  and: function (taskCopyForProcess, andArgs) {
    console.log('operator is and')
    let andArgValues = []

    andArgs.forEach((andArg) => {
      let refValue = a1ToRefValue(taskCopyForProcess, andArg.reference)
      let targetValue = Object.values(refValue.value)[0]
      andArgValues.push(targetValue)
    })

    // checking typeof arguments. Object.is - comparing two value. true if same.
    let checkAndTypeofFunc = (total, nextArg) => Object.is(typeof total, typeof nextArg)
    let checkAndTypeof = andArgValues.reduce(checkAndTypeofFunc)

    if (checkAndTypeof) {
      let andFunc = (total, nextArg) => total && nextArg
      let andResult = andArgValues.reduce(andFunc)
      return {'value': {[typeof andResult]: andResult}}
    }
    return {'error': "type does not match"} // JavaScript return 'true && 1 = 1'
  },

  or: function (taskCopyForProcess, orArgs) {
    console.log('operator is or')
    let orArgValues = []

    orArgs.forEach((orArg) => {
      let refValue = a1ToRefValue(taskCopyForProcess, orArg.reference)
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
      return {'value': {[typeof orResult]: orResult}}
    }
    return {'error': "type does not match"} // JavaScript return 'true || 1 = true'
  },

  if: function (taskCopyForProcess, ifArgs) {
    console.log('operator is if')
    // Arguments:
    // 1 - condition (must be a boolean),
    let ifConditArg = Object.keys(ifArgs[0])[0]
    if (ifConditArg !== 'value') {
      ifArgs[0] = this[ifConditArg](taskCopyForProcess, ifArgs[0][ifConditArg])
    }
    if (ifArgs[0].value.boolean) {
      // write truthy value
      // 2 - value if condition is true.
      let ifCondTrue = ifArgs[1]
      return a1ToRefValue(taskCopyForProcess, ifCondTrue.reference)
    } else {
      // write falsy value
      // 3 - value if condition is false.
      let ifCondFalse = ifArgs[2]
      return a1ToRefValue(taskCopyForProcess, ifCondFalse.reference)
    }
  },

  concat: function (taskCopyForProcess, concArgs) {
    console.log('operator is concat')
    let concRes = []
    concArgs.forEach((concArg) => {
      concRes.push(Object.values(Object.values(concArg)[0])[0])
    })
    concRes = ''.concat(...concRes)
    return {'value': {'text': concRes}}
  }
}
