export function pick(object, paths) {
  let list = []
  paths.forEach(key => {
    if (object.hasOwnProperty(key)) {
      list.push(object[key])
    }
  })
  return list
}
