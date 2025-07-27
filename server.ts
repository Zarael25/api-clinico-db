import Debug from 'debug'

import app from './src/app'

const debug = Debug('app:server')
const port = app.get('port')

app.listen(port, () => {
  debug(`Listening http://localhost:${port}`)
})
