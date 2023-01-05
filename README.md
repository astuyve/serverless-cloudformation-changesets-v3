# serverless-cloudformation-changesets
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)


Serverless framework plugin to create CloudFormation ChangeSets. Originally [forked](https://github.com/trek10inc/serverless-cloudformation-changesets) with the following modifications:
- Supports Serverless v3 new params
- Removed Serverless@1.89 dependency and specified peer dependency on Serverless ^3.0
- Removed dependency on Lodash

## Installation

Install the plugin from npm

```bash
$ npm install --save serverless-cloudformation-changesets
```

Add the plugin to your `serverless.yml` file:

```yaml
plugins:
  - serverless-cloudformation-changesets
```

## Usage
#### CLI options
Add `--changeset` option to the sls deployment command, e.g.:
```bash
$ sls deploy --stage dev --region us-east-1 --param="changeset"
```
`changeset` by default uses a timestamp for ChangeSet name, otherwise you can provide optional `changeset` value:
```bash
$ sls deploy --stage dev --region us-east-1 --param='changeset=your-changeset-name'
```

#### YAML settings
```yaml
custom:
  cf-changesets:
    changeSetName: whatever # optional
    requireChangeSet: boolean # optional defaults to false
```
`requireChangeSet` - if true, ChangeSets will be created without providing `changeset` option to the `sls deploy` command.

## Notice
If CloudFormation Stack doesn't exist and custom `provider.deploymentBucket` was specified, this plugin will create a new stack without template, resources. The stack will be in the `REVIEW_IN_PROGRESS` state.
