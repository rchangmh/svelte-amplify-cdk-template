import App from "./App.svelte"
import Amplify from '@aws-amplify/core'

import * as config from '../aws-exports.json'
let awsConfig = JSON.parse(config[Object.keys(config)[0]]['amplifyConfig'])
Amplify.configure(awsConfig)

// @ts-ignore
export default new App({ target: document.body })