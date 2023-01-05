'use strict'

const createChangeSet = (plugin, stackName, changeSetName, changeSetType) => {
  const compiledTemplateFileName = 'compiled-cloudformation-template.json'
  const templateUrl = `https://s3.amazonaws.com/${plugin.bucketName}/${plugin.serverless.service.package.artifactDirectoryName}/${compiledTemplateFileName}`

  let stackTags = {}
  // Merge additional stack tags
  stackTags['STAGE'] = plugin.provider.getStage()
  if (typeof plugin.serverless.service.provider.stackTags === 'object') {
    stackTags = Object.assign(stackTags, plugin.serverless.service.provider.stackTags)
  }

  const Tags = Object.keys(stackTags).map((key) => ({
      Key: key,
      Value: stackTags[key]
    }))

  const params = {
    StackName: stackName,
    ChangeSetName: changeSetName,
    Capabilities: [
      'CAPABILITY_IAM',
      'CAPABILITY_NAMED_IAM'
    ],
    ChangeSetType: changeSetType,
    Parameters: [],
    TemplateURL: templateUrl,
    Tags
  }

  if (plugin.serverless.service.provider.cfnRole) {
    params.RoleARN = plugin.serverless.service.provider.cfnRole
  }

  return plugin.provider
    .request(
      'CloudFormation',
      'createChangeSet',
      params,
      plugin.options.stage,
      plugin.options.region
    )
}

module.exports = {
  createChangeSet () {
    const stackName = this.provider.naming.getStackName()
    const changeSetName = this.options.changeSetName ? this.options.changeSetName : `${stackName}-${Date.now()}`

    this.serverless.cli.log(`Creating CloudFormation ChangeSet [${changeSetName}]...`)
    return createChangeSet(this, stackName, changeSetName, 'UPDATE')
      .catch(e => {
        if (e.message.indexOf('does not exist') > -1) {
          this.serverless.cli.log(`Stack [${stackName}] does not exist. Creating a new empty stack...`)
          return createChangeSet(this, stackName, changeSetName, 'CREATE')
        }
        console.log('ERROR IS', e)
        throw e
      })
  }
}
