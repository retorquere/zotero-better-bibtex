import * as findUp from 'find-up'
import * as path from 'path'

export default path.dirname(findUp.sync('tsconfig.json'))
