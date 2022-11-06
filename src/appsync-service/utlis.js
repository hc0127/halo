export const stringify = (item, validator) => {
  if (item === null || item === undefined) return 'null'

  if (validator === 'enum') return item
  if (validator === 'number') return item
  if (typeof item === 'boolean' || item === 'true' || item === 'false') {
    return item
  }

  if (validator === 'json') {
    item = JSON.stringify(item)
  } else if (Array.isArray(item)) {
    item = item.toString()
  }

  item = item.replace(/"/g, '\\"')

  return `"${item}"`
}

export const validateAndGenerateFields = (fields, validatorObject) => {
  let updateAbleFields = []

  for (let key in fields) {
    if (!(key in validatorObject)) {
      continue
    }

    let value = fields[key]
    let validator = validatorObject[key]

    let field = `${key}: ${stringify(value, validator)}`
    updateAbleFields.push(field)
  }

  return updateAbleFields.join(', ')
}
