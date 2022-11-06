#!/usr/bin/env bash

if ! [ -x "$(command -v aws)" ]; then
    echo "Error, aws not installed. Please install aws-cli" >&2
    exit 1
fi

REGIONS=$(aws ec2 describe-regions --query "Regions[].RegionName" --output text)

REQUIRED_CONFIG_VARIABLES=(Region MasterTemplate CFS3Bucket StackName StackPolicy CreationFailureAction)
ACTIONS=(validate-template package-template create-change-set create-or-update-stack get-stack-outputs)

#-------------------------------------------------------------------------------
# Validate whether a string exists in given list
#
# Args:
# $1  List of strings
# $2  Item to search for
#-------------------------------------------------------------------------------
validate_in_list() {
    LIST="$1"
    ITEM=$2
    echo "$LIST" | grep -F -q -w "$ITEM";
}

#-------------------------------------------------------------------------------
# Validate program parameters
#
# Args:
# $1  Config directory
# $2  Action
#-------------------------------------------------------------------------------
validate_program_parameters() {

    if ! [[ -d "$_arg_config_directory" ]]; then
        die "${_arg_config_directory} must be a directory" 1
    fi

    # Remove trailing slashes
    shopt -s extglob;
    _arg_config_directory="${_arg_config_directory%%+(/)}"

    _arg_cloudformation_config_file_path="${_arg_config_directory}/${_arg_cloudformation_config}"
    if ! [[ -f "$_arg_cloudformation_config_file_path" ]]; then
        die "$_arg_cloudformation_config_file_path not found" 1
    fi

    _arg_parameters_file_path="${_arg_config_directory}/${_arg_parameters}"
    if ! [[ -f "$_arg_parameters_file_path" ]]; then
        die "$_arg_parameters_file_path not found" 1
    fi

    if ! validate_in_list "${ACTIONS[*]}" ${_arg_action}; then
        die "Action invalid" 1
    fi
}

#-------------------------------------------------------------------------------
# Validate required config variables and set as program variables within this script
#-------------------------------------------------------------------------------
validate_and_set_config_variables() {
    for VARIABLE in "${REQUIRED_CONFIG_VARIABLES[@]}"; do
        # See if VARIABLE exists in CONFIG_FILE_PATH and it has a value
        variable_value=$(grep "${VARIABLE}=" ${_arg_cloudformation_config_file_path} | cut -f 2 -d =)

        if [[ -z "$variable_value" ]]; then
            echo "${VARIABLE} must be set and have a value in ${_arg_cloudformation_config_file_path}" 1>&2 && exit 1
        fi

        printf -v "$VARIABLE" "%s" ${variable_value}
    done

    TemplateFilePath="templates/${MasterTemplate}"
    OutputTemplateFilePath="bin/master-${StackName}.yaml"

    # Check region is in REGIONS array
    if ! validate_in_list "$REGIONS" ${Region}; then
        die "${Region} is not a valid AWS region" 1
    fi
    # Set AWS_DEFAULT_REGION so we don't have to specify --region on all CLI commands
    export AWS_DEFAULT_REGION=${Region}
}

#-------------------------------------------------------------------------------
# Convert the parameters file into the format required by cloudformation api commands
#-------------------------------------------------------------------------------
get_parameter_list() {
    while IFS== read key val
    do
        # Check if parameter refers to SSM Secure Parameter, if so obtain & decrypt
        if [[ "$val" =~ ^resolve:ssm-secure:(\/.+)$ ]]; then
            ssm_param="${BASH_REMATCH[1]}"
            ssm_val=$(aws ssm get-parameter --name "${ssm_param}" --with-decryption --output text --query "Parameter.Value")
            if [ $? -ne 0 ]; then
                die "$ssm_param could not be retrieved from SSM Secure Parameter Store" 1
            fi
            val=${ssm_val}
        fi
        echo -n "ParameterKey=${key},ParameterValue=${val} "
    done < <(grep "" ${_arg_parameters_file_path})
}

#-------------------------------------------------------------------------------
# Validate that template exists and YAML is well formed
#-------------------------------------------------------------------------------
validate-template() {
    if ! [[ -f "$TemplateFilePath" ]]; then
        echo "MasterTemplate not found - ${TemplateFilePath}" 1>&2 && exit 1
    fi

    aws cloudformation validate-template --template-body file://"$TemplateFilePath" > /dev/null

    if [ $? -ne 0 ]; then
        echo "Failed to validate cloudformation template" && exit 1
    fi
}

#-------------------------------------------------------------------------------
# Package and compile master template, uploading nested templates to S3
#-------------------------------------------------------------------------------
package-template() {
    aws cloudformation package \
        --template-file ${TemplateFilePath} \
        --s3-bucket ${CFS3Bucket} \
        --output-template-file ${OutputTemplateFilePath}

    if [ $? -ne 0 ]; then
        echo "Failed to package cloudformation template" && exit 1
    fi
}

#-------------------------------------------------------------------------------
# If a stack exists, create a change set listing all of the changes that will be
# made if you deploy the latest version.
# If there are any changes, send a slack message
#-------------------------------------------------------------------------------
create-change-set() {
    stack_status=$(aws cloudformation describe-stacks \
        --stack-name ${StackName} \
        --query Stacks[].StackStatus \
		--output text
    )

    if [[ $? -eq 0 ]] && [[ "${stack_status}" != "REVIEW_IN_PROGRESS" ]]; then
        change_set_type="UPDATE"
    else
        echo "Stack doesn't exist, exiting" 1>&2 && exit 0
    fi

    change_set_name="${StackName}$(date +%s)"

    # Create change set
    change_set_arn=$(aws cloudformation create-change-set \
        --stack-name ${StackName} \
        --template-body file://"${OutputTemplateFilePath}" \
        --parameters $(get_parameter_list) \
        --capabilities CAPABILITY_NAMED_IAM \
        --change-set-name ${change_set_name} \
        --change-set-type ${change_set_type} \
        --query Id \
        --output text
    )

    # Wait for it to be created
	local status

	status=$(aws cloudformation describe-change-set \
	    --change-set-name ${change_set_arn} \
	    --query Status \
	    --output text
    )

	while [[ "$status" != "CREATE_COMPLETE" ]]; do
		echo "Waiting for change set ${change_set_name} to obtain status CREATE_COMPLETE - Current status: $status"

		# If the status is not one of the "_IN_PROGRESS" status' then consider
		# this an error
		if [[ "$status" == "FAILED" ]]; then
			echo "Unexpected status $status" 1>&2 && exit 1
		fi

		status=$(aws cloudformation describe-change-set \
	        --change-set-name ${change_set_arn} \
	        --query Status \
	        --output text
        )

		sleep 5
	done

	# Describe it
	echo "The following changes will occur if you update this CloudFormation stack:"
	aws cloudformation describe-change-set \
	    --change-set-name ${change_set_arn} \
	    --query Changes[]
    changes=$(aws cloudformation describe-change-set \
        --change-set-name ${change_set_arn} \
        --query "Changes[] | length(@)"
    )
    if [ ${changes} -gt 0 ]; then
        echo "CloudFormation changes need reviewed! SEND SLACK MESSAGE HERE"
    fi
	# Delete it
	aws cloudformation delete-change-set \
	    --change-set-name ${change_set_arn}
}

#-------------------------------------------------------------------------------
# If a stack does not exist, create it.
# If it does, update it.
#-------------------------------------------------------------------------------
create-or-update-stack() {
    aws cloudformation describe-stacks \
        --stack-name ${StackName} \
        --query Stacks[].StackStatus \
		--output text

    if [[ $? -eq 0 ]]; then
        stack_exists=1
    else
        stack_exists=0
    fi

    local expected_final_status
    # Update
    if [[ "${stack_exists}" -eq 1 ]]; then
        # We may have changed stack policy to allow specific update. Therefore apply new stack policy b4 update.
        apply-stack-policy-to-nested-stacks
        aws cloudformation update-stack \
            --stack-name ${StackName} \
            --template-body file://${OutputTemplateFilePath} \
            --parameters $(get_parameter_list) \
            --capabilities CAPABILITY_NAMED_IAM \
            --stack-policy-body file://${StackPolicy}
        if [[ $? -ne 0 ]]; then
           echo "Failed to update stack" 1>&2 && exit 1
        fi
        expected_final_status="UPDATE_COMPLETE"
    # Create
    else
        aws cloudformation create-stack \
            --stack-name ${StackName} \
            --template-body file://${OutputTemplateFilePath} \
            --parameters $(get_parameter_list) \
            --capabilities CAPABILITY_NAMED_IAM \
            --enable-termination-protection \
            --on-failure ${CreationFailureAction} \
            --stack-policy-body file://${StackPolicy}
        if [[ $? -ne 0 ]]; then
            echo "Failed to create stack" 1>&2 && exit 1
        fi
        expected_final_status="CREATE_COMPLETE"
    fi

    local status

    status=$(aws cloudformation describe-stacks \
        --stack-name ${StackName} \
        --query Stacks[].StackStatus \
        --output text
    )

    while [[ "${status}" != "${expected_final_status}" ]]; do
        echo "Waiting for stack to reach ${expected_final_status} - currently ${status}"

        # If the status is not one of the "_IN_PROGRESS" status' then consider this an error
		if [[ "${status}" != *"_IN_PROGRESS"* ]]; then
			echo "Unexpected status $status" 1>&2
			aws cloudformation describe-stack-events \
			    --stack-name ${StackName}
            exit 1
		fi

        status=$(aws cloudformation describe-stacks \
            --stack-name ${StackName} \
            --query Stacks[].StackStatus \
            --output text
        )

		sleep 10
    done

    # On first time creation, apply stack policy to nested stacks
    if [[ "${stack_exists}" -ne 1 ]]; then apply-stack-policy-to-nested-stacks; fi
    echo "Stack creation / update successful!"
    echo "Outputs:"
    get-stack-outputs
}

#-------------------------------------------------------------------------------
# If the stack exists, display stack outputs in key=val format
#-------------------------------------------------------------------------------
get-stack-outputs() {
   aws cloudformation describe-stacks --stack-name ${StackName} --no-paginate --output text \
        --query "Stacks[].Outputs[].[OutputKey,OutputValue]" | tr '\t' '='
}

#-------------------------------------------------------------------------------
# Nested stacks don't automatically inherit stack policy of parent
# This applies the policy to nested stacks, helping prevent unwanted actions
# on resources in nested stacks.
#-------------------------------------------------------------------------------
apply-stack-policy-to-nested-stacks() {
    echo "Applying stack policy to nested stacks to prevent future disasters"
    local nested_stacks
    nested_stacks=$(aws cloudformation list-stack-resources \
        --stack-name ${StackName} \
        --query "StackResourceSummaries[?ResourceType=='AWS::CloudFormation::Stack'].[PhysicalResourceId]" \
        --output text
    )
    for stack in ${nested_stacks}; do
        aws cloudformation set-stack-policy --stack-name ${stack} --stack-policy-body file://${StackPolicy}
    done
}

# ARG_POSITIONAL_SINGLE([config_directory],[The directory where to look for cloudformation config and parameters files])
# ARG_POSITIONAL_SINGLE([action],[The action to carry out. It can be one of following:\n validate-template: validates the master stack template for YAML/CF syntax\n package-template: compile the master stack template, uploading nested stacks to S3 and placing compiled template in bin/\n create-change-set: creates a change set and describes any changes, if any, that will occur\n create-or-update-stack: creates the stack if it doesnt exist, updates existing stack if it does\n get-stack-outputs: if the stack exists, get the outputs in key=val format])
# ARG_OPTIONAL_SINGLE([cloudformation-config],[c],[The file that contains the meta configuration for the CloudFormation stack, relative to config_directory],[cloudformation-config])
# ARG_OPTIONAL_SINGLE([parameters],[p],[The file that contains the parameters for the CloudFormation stack, relative to config_directory],[parameters])
# ARG_HELP([This script is a wrapper for CloudFormation APIs, to make tasks easier to perform.])
# ARGBASH_GO()
# needed because of Argbash --> m4_ignore([
### START OF CODE GENERATED BY Argbash v2.6.1 one line above ###
# Argbash is a bash code generator used to get arguments parsing right.
# Argbash is FREE SOFTWARE, see https://argbash.io for more info
# Generated online by https://argbash.io/generate

die()
{
	local _ret=$2
	test -n "$_ret" || _ret=1
	test "$_PRINT_HELP" = yes && print_help >&2
	echo "$1" >&2
	exit ${_ret}
}

begins_with_short_option()
{
	local first_option all_short_options
	all_short_options='cph'
	first_option="${1:0:1}"
	test "$all_short_options" = "${all_short_options/$first_option/}" && return 1 || return 0
}



# THE DEFAULTS INITIALIZATION - POSITIONALS
_positionals=()
# THE DEFAULTS INITIALIZATION - OPTIONALS
_arg_cloudformation_config="cloudformation-config"
_arg_parameters="parameters"

print_help ()
{
	printf '%s\n' "This script is a wrapper for CloudFormation APIs, to make tasks easier to perform."
	printf 'Usage: %s [-c|--cloudformation-config <arg>] [-p|--parameters <arg>] [-h|--help] <config_directory> <action>\n' "$0"
	printf '\t%s\n' "<config_directory>: The directory where to look for cloudformation config and parameters files"
	printf '\t%s\n' "<action>: The action to carry out. It can be one of following:
		 validate-template: validates the master stack template for YAML/CF syntax
		 package-template: compile the master stack template, uploading nested stacks to S3 and placing compiled template in bin/
		 create-change-set: creates a change set and describes any changes, if any, that will occur
		 create-or-update-stack: creates the stack if it doesnt exist, updates existing stack if it does
		 get-stack-outputs: if the stack exists, get the outputs in key=val format"
	printf '\t%s\n' "-c,--cloudformation-config: The file that contains the meta configuration for the CloudFormation stack (default: 'cloudformation-config')"
	printf '\t%s\n' "-p,--parameters: The file that contains the parameters for the CloudFormation stack (default: 'parameters')"
	printf '\t%s\n' "-h,--help: Prints help"
}

parse_commandline ()
{
	while test $# -gt 0
	do
		_key="$1"
		case "$_key" in
			-c|--cloudformation-config)
				test $# -lt 2 && die "Missing value for the optional argument '$_key'." 1
				_arg_cloudformation_config="$2"
				shift
				;;
			--cloudformation-config=*)
				_arg_cloudformation_config="${_key##--cloudformation-config=}"
				;;
			-c*)
				_arg_cloudformation_config="${_key##-c}"
				;;
			-p|--parameters)
				test $# -lt 2 && die "Missing value for the optional argument '$_key'." 1
				_arg_parameters="$2"
				shift
				;;
			--parameters=*)
				_arg_parameters="${_key##--parameters=}"
				;;
			-p*)
				_arg_parameters="${_key##-p}"
				;;
			-h|--help)
				print_help
				exit 0
				;;
			-h*)
				print_help
				exit 0
				;;
			*)
				_positionals+=("$1")
				;;
		esac
		shift
	done
}


handle_passed_args_count ()
{
	_required_args_string="'config_directory' and 'action'"
	test ${#_positionals[@]} -ge 2 || _PRINT_HELP=yes die "FATAL ERROR: Not enough positional arguments - we require exactly 2 (namely: $_required_args_string), but got only ${#_positionals[@]}." 1
	test ${#_positionals[@]} -le 2 || _PRINT_HELP=yes die "FATAL ERROR: There were spurious positional arguments --- we expect exactly 2 (namely: $_required_args_string), but got ${#_positionals[@]} (the last one was: '${_positionals[*]: -1}')." 1
}

assign_positional_args ()
{
	_positional_names=('_arg_config_directory' '_arg_action' )

	for (( ii = 0; ii < ${#_positionals[@]}; ii++))
	do
		eval "${_positional_names[ii]}=\${_positionals[ii]}" || die "Error during argument parsing, possibly an Argbash bug." 1
	done
}

parse_commandline "$@"
handle_passed_args_count
assign_positional_args

# OTHER STUFF GENERATED BY Argbash

### END OF CODE GENERATED BY Argbash (sortof) ### ])


validate_program_parameters
validate_and_set_config_variables
${_arg_action}