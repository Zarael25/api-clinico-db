import Debug from 'debug'

import app from './app'

const debug = Debug('app:server')
const port = app.get('port')

app.listen(port, '0.0.0.0', () => {
  debug(`Listening http://localhost:${port}`)
})
