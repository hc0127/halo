# Cloudformation Provisioning

**provision.sh**

This tool prepares the AWS infrastructure required for running CloudFormation.

CloudFormation itself has 2 requirements to run it:

 - **An AWS user with API access keys to execute CloudFormation API calls.**
 This is to bring up the infrastructure stack, update it, or delete it.
 The user needs all the permissions required to create individual parts
 of infrastructure, such as EC2 permissions to bring up EC2 instances.
 - **An S3 bucket to upload compiled templates to.** CloudFormation is made
 up of several template files describing the infrastructure to provision.
 These template files get compiled (variable substitution etc.) and saved
 to S3 so AWS has access to them.


## How to run it

We need to run this provisioning on a per project & environment basis.

So for one project, it needs to be ran for dev, qa, uat and prod.

You will need to run it with a correct AWS admin profile set up. For
example, if dev and qa are to be set up on our hedgehoglab AWS account,
you need an AWS CLI account set up with admin privileges on our hedgehoglab
account. If setting up uat and prod on a client account, set up your
AWS CLI profile to use the API access keys with admin privileges on the
clients AWS account. [aws-vault](https://github.com/99designs/aws-vault)
is useful for this, so you can do `aws-vault exec --no-session <profile> -- ./provision.sh ...`

The tool will either retrieve details about resources already provisioned,
 or create the resources. It will output details to the console and also
 create files in `[<dest-dir>]`.

It is recommended to create a directory somewhere on your local machine for
`<project>`, and then create individual `<environment>` directories within
that. Then you can specify `<base dir>/<project>/<environment>` as the
argument for `[<dest-dir>]`.

You can either specify individual resources / actions to provision, or
run all of the provisioning actions.

### Actions

 - **create-cf-bucket** - Output bucket name to `bucket_name` in `[<dest-dir>]`.
 This is required in `cloudformation-config`
 - **create-ec2-keypair** - Output key name to `key_name` in `[<dest-dir>]`.
 This is required in `cloudformation-config`. Output SSH private key to
 `<project>-<environment>-key.pem` in `[<dest-dir>]`. This should be stored
 in 1password.
 - **create-cf-user** - Output username to `cf_iam_username` in `[<dest-dir>]`.
 This should be stored in 1password. Output Access Key Id to `cf_iam_access_key_id`
 in `[<dest-dir>]`. This should be used in GitLab when setting up CI/CD
 and stored in 1password. Output Secret Access Key to `cf_iam_secret_access_key`
 in `[<dest-dir>]`. This should be used in GitLab when setting up CI/CD and
 stored in 1password.
 - **create-parameter-store-key** - Output key id to `parameter_store_key_id`
 in `[<dest-dir>]`. This is required in `cloudformation-config`.
 - **create-ecr-repositories** - Output newline delimited list of ECR
 repository URLs to `ecr_repositories` in `[<dest-dir>]`. These are
 required in cloudformation-config.
 - **setup-ssm-session-manager** - Creates log group and SSM document to
 set up SSM Session Manager, an alternative to SSH access, allowing connecting
 to instances via AWS console.

### Usage

Run `./provision.sh` or `./provision.sh --help` to get usage information.