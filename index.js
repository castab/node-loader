const axios = require('axios')
const axiosRetry = require('axios-retry')
const cliProgress = require('cli-progress')
const { users, additionalUsers } = require('./processor')

const allUsers = new Map([...additionalUsers, ...users])
// Note that if multiple maps have the same key, the value of the merged map 
// will be the value of the last merging map with that key.

const URL = "http://192.168.1.17:32770"
const PATH = "/user"
const MAX_RETRY = 5

axiosRetry(axios, { retries: MAX_RETRY, retryDelay: axiosRetry.exponentialDelay })

let successCount = 0
let failCount = 0
let totalCount = 0
let promises = []

const progress = new cliProgress.SingleBar(
    { format: 'Progress [{bar}] {percentage}% | {value}/{total} | {duration}s' }
  )

console.log(`There are ${allUsers.size} test users to enter into the database.`)
progress.start(allUsers.size, 0, {speed: "N/A", hideCursor: true})
allUsers.forEach( user => {
  promises.push(
    axios.post(
      URL + PATH, user
    ).then( () => {
      successCount++
      return `Inserted user: ${user.first_name} ${user.last_name}`
    }, err => {
      let message = `No failure reason given for user: ${user.first_name} ${user.last_name}`
      if (err && err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message
      } else if (err && err.request) {
        message = `Server failed to respond.`
      }
      failCount++
      return message
    }).catch( () => {
      failCount++
      return 'Unknown exception.'
    }).finally( () => {
      totalCount++
      progress.increment()
    })
  )
})

Promise.allSettled(promises).then( results  => {
  // results.forEach( result => {
  //   console.log(result)
  // })
  progress.stop()
  console.log('Upload complete.')
  console.log(`Total: ${totalCount}, Success: ${successCount}, Fail: ${failCount}`)
  process.exit()
})
