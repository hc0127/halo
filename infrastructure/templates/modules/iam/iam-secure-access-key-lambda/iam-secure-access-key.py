import cfnresponse
import boto3


def handler(event, context):
    # If event is delete type, immediately return success
    if event['RequestType'] == 'Delete':
        cfnresponse.send(event, context, cfnresponse.SUCCESS, {})

        return {}

    try:
        iam_client = boto3.client('iam')
        access_keys = iam_client.list_access_keys(UserName=event['ResourceProperties']['UserName'])
        if len(access_keys['AccessKeyMetadata']) > 0:
            cfnresponse.send(event, context, cfnresponse.SUCCESS,
                             {'AccessKeyId': access_keys['AccessKeyMetadata'][0]['AccessKeyId']})

            return {'AccessKeyId': access_keys['AccessKeyMetadata'][0]['AccessKeyId']}

        access_key = iam_client.create_access_key(UserName=event['ResourceProperties']['UserName'])

        ssm_client = boto3.client('ssm')
        ssm_client.put_parameter(
            Name="/{}_{}/{}".format(
                event['ResourceProperties']['Project'].lower(),
                event['ResourceProperties']['Environment'].lower(),
                event['ResourceProperties']['AccessKeyIdName'].lower()
            ),
            Value=access_key['AccessKey']['AccessKeyId'],
            Type="SecureString",
            KeyId=event['ResourceProperties']['ParameterStoreKeyId'],
            Overwrite=True
        )
        ssm_client.put_parameter(
            Name="/{}_{}/{}".format(
                event['ResourceProperties']['Project'].lower(),
                event['ResourceProperties']['Environment'].lower(),
                event['ResourceProperties']['AccessKeyIdName'].lower()
            ),
            Value=access_key['AccessKey']['SecretAccessKey'],
            Type="SecureString",
            KeyId=event['ResourceProperties']['ParameterStoreKeyId'],
            Overwrite=True
        )

        cfnresponse.send(event, context, cfnresponse.SUCCESS, {'AccessKeyId': access_key['AccessKey']['AccessKeyId']})

        return {'AccessKeyId': access_key['AccessKey']['AccessKeyId']}
    except Exception as e:
        print("Unexpected error: {}".format(e))

        cfnresponse.send(event, context, cfnresponse.FAILED, {})

        return {}
