export function pick(object, paths) {
  let list = []
  paths.forEach(key => {
    if (object.hasOwnProperty(key)) {
      list.push(object[key])
    }
  })
  return list
}

export function deepCopy(object) {
  let other = {}
  Object.keys((key) => {
    if (object[key] instanceof Object) {
      other[key] = deepCopy(object[key])
    } else {
      other[key] = object[key]
    }
  })
  return other
}
