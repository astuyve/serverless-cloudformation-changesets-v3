'use strict'

const createChangeSet = require('./lib/createChangeSet')
const setBucketName = require('serverless/lib/plugins/aws/lib/set-bucket-name')

const changeSetPair = (params) => {
  if (!params) {
    return
  }
  // TODO: refactor to use optional chaining when node12 support is dropped
  const paramPair = params.filter((param) => param.startsWith('changeset') )[0]
  if (!paramPair) {
    return
  }
  const [requireChangeSet, changeSetName] = paramPair.split('=')

  return {
    requireChangeSet: !!requireChangeSet,
    changeSetName
  }
}

class ServerlessCloudFormationChangeSets {
  constructor (serverless, options) {
    this.serverless = serverless
    // TODO: refactor to use optional chaining when node12 support is dropped
    this.options = Object.assign({}, serverless.service && serverless.service.custom && serverless.service.custom['cf-changesets'], options)
    this.provider = this.serverless.getProvider('aws')


    if (options.param) {
      const { requireChangeSet, changeSetName } = changeSetPair(options.param)
      this.options.requireChangeSet = requireChangeSet
      this.options.changeSetName = changeSetName
    }

    if (this.options.requireChangeSet) {
      this.hooks = {
        'before:aws:deploy:deploy:updateStack': this.lockStackDeployment.bind(this),
        'aws:deploy:deploy:updateStack': () => Promise.resolve()
          .then(setBucketName.setBucketName.bind(this))
          .then(createChangeSet.createChangeSet.bind(this)),
        'after:aws:deploy:deploy:updateStack': this.unlockStackDeployment.bind(this)
      }
    }
  }

  lockStackDeployment () {
    this.shouldNotDeploy = this.serverless.service.provider.shouldNotDeploy
    this.serverless.service.provider.shouldNotDeploy = true
  }

  unlockStackDeployment () {
    this.serverless.service.provider.shouldNotDeploy = this.shouldNotDeploy
  }
}

module.exports = ServerlessCloudFormationChangeSets
