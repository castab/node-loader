function generatePhoneNumbers(prefix) {
  let numbers = []
  let counter = 0
  while (numbers.length < 99999) {
    const trailer = counter.toString().padStart(7, '0')
    const number = parseInt(`${prefix}${trailer}`)
    numbers.push(number)
    counter++
  }
  return numbers
}

function randomIndexGenerator(limit) {
  return Math.floor(Math.random() * limit)
}

function getAnItemFromArrayOfFakesAndThenRemoveIt(array_of_fakes) {
  if (array_of_fakes.length == 0) throw `The array: ${array_of_fakes.constructor.name} has run out.`
  const rand_index = randomIndexGenerator(array_of_fakes.length)
  const item = array_of_fakes[rand_index]
  array_of_fakes.splice(rand_index, 1)
  return item
}

const emailDomains = ['aol', 'hotmail', 'yahoo', 'netzero', 'compuserve', 'msn', 'microsoft', 'outlook']
const gtlDs = ['.com', '.net', '.gov', '.edu', '.org', '.mil']
function generateEmailAddress(name) {
  const middle = name.middle ? `_${name.middle}` : ''
  const alias = name.alias ? `_${name.alias}` : ''
  const rand_email_index = randomIndexGenerator(emailDomains.length)
  const rand_gtlD_index = randomIndexGenerator(gtlDs.length)
  return `${name.last}_${name.first}${middle}${alias}@${emailDomains[rand_email_index]}${gtlDs[rand_gtlD_index]}`
}

function generateUserObject(name, fake_phone_numbers) {
  return {
    first_name: name.first,
    middle_name: name.middle ? name.middle : null,
    last_name: name.last,
    alias: name.alias ? name.alias : null,
    email: {
      primary: generateEmailAddress(name),
    },
    tel: {
      primary: getAnItemFromArrayOfFakesAndThenRemoveIt(fake_phone_numbers),
      secondary: getAnItemFromArrayOfFakesAndThenRemoveIt(fake_phone_numbers),
    },
  }
}

function generateUsers() {
  let names = JSON.parse(JSON.stringify(require('./names')))
  let fake_phone_numbers = generatePhoneNumbers("555")
  let users_map = new Map()
  while (names.length > 0) {
    const rand_selected_name = getAnItemFromArrayOfFakesAndThenRemoveIt(names)
    const user = generateUserObject(rand_selected_name, fake_phone_numbers)
    const id = user.middle_name ? `${user.last_name}_${user.first_name}_${user.middle_name}` : `${user.last_name}_${user.first_name}`
    users_map.set(id, user)
  }
  return users_map
}

function generateAdditionalUsers() {
  let firstNames = []
  let lastNames = []
  let users_map = new Map()
  let names = JSON.parse(JSON.stringify(require('./names')))
  let fake_phone_numbers = generatePhoneNumbers("777")
  names.forEach( name => {
    firstNames.push(name.first)
    lastNames.push(name.last)
  })
  firstNames.forEach( firstName => {
    lastNames.forEach( lastName => {
      const id = `${lastName}_${firstName}`
      const generated_name = {
        first: firstName,
        last: lastName,
        middle: '',
        alias: '',
      }
      users_map.set(id, generateUserObject(generated_name, fake_phone_numbers))
    })
  })
  return users_map
}

exports.users = generateUsers()
exports.additionalUsers = generateAdditionalUsers()
