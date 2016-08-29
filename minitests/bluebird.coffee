Promise = require('bluebird')

someAsyncTask = ->
  return new Promise((resolve) ->
    delay = Math.floor(Math.random() * 10000)

    setTimeout(->
      resolve(delay)
    , delay)
  )


main = Promise.coroutine((sequenceName) ->
  #console.log(sequenceName, 'starting 1st step')
  result1 = yield someAsyncTask()
  #console.log(sequenceName, 'starting 2nd step')
  result2 = yield someAsyncTask()
  #console.log(sequenceName, 'starting 3rd step')
  result3 = yield someAsyncTask()

  #console.log(sequenceName, 'done after', result1 + result2 + result3)
  return result1 + result2 + result3
)

console.log(typeof main('first sequence').then)

#Promise.try(main('first sequence')).then((success) ->
#  console.log(1)
#)
#Promise.try(main('second sequence')).then((success) ->
#  console.log(2)
#)

#console.log('all systems go!')
