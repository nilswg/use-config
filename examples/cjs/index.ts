import {useConfig} from '../../dist'

process.argv.push('$c=test', "--config=test")
console.log(useConfig({ flag: '$', configKey: 'c', delimiter:"="}))
 