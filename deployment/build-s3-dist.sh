#!/bin/bash
#
# This script will perform the following tasks:
#   1. Remove any old dist files from previous runs.
#   2. Install dependencies for the cdk-solution-helper; responsible for
#      converting standard 'cdk synth' output into solution assets.
#   3. Build and synthesize your CDK project.
#   4. Run the cdk-solution-helper on template outputs and organize
#      those outputs into the /global-s3-assets folder.
#   5. Organize source code artifacts into the /regional-s3-assets folder.
#   6. Remove any temporary files used for staging.
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./build-s3-dist.sh source-bucket-base-name [solution-name [version-code]]
#
# Parameters:
#  - source-bucket-base-name: Name for the S3 bucket location where the template will source the Lambda
#    code from. The template will append '-[region_name]' to this bucket name.
#    For example: ./build-s3-dist.sh solutions my-solution v1.2.0
#    The template will then expect the source code to be located in the solutions-[region_name] bucket
#  - solution-name: name of the solution for consistency
#  - version-code: version of the package
[ "$DEBUG" == 'true' ] && set -x
set -e

# Check to see if input has been provided:
if [ -z "$1" ]; then
    echo "Please provide all required parameters for the build script"
    echo "For example: ./build-s3-dist.sh solutions trademarked-solution-name v1.2.0"
    exit 1
fi

# set the PWD to the directory containing this script so we can run
# the script from anywhere and the relative paths below still work.
cd "$(dirname "${BASH_SOURCE[0]}")"

# Get reference for all important folders
declare -r template_dir="$PWD"
declare -r staging_dist_dir="$template_dir/staging"
declare -r template_dist_dir="$template_dir/global-s3-assets"
declare -r build_dist_dir="$template_dir/regional-s3-assets"
declare -r source_dir="$template_dir/../source"

declare -r bucket_name="$1"
declare -r solution_name="${2:-video-on-demand-on-aws-foundation}"

# Check if the version argument is a valid version (semantic version-like).
# Example:
#   v21.13.5-develop
#   ^       ^^^^^^^^
#    \         /
#      optional
if [[ "${3:-undefined}" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+(-.*)?$ ]]
then
  # It matches the pattern so use it as-is.
  declare -r semantic_version="${3}"
else
  # The version string didn't match the pattern so extract the
  # version from the CDK package.json so we have a valid version.
  declare -r semantic_version=v$(cat "$source_dir/cdk/package.json" \
    | tr -d ' \r\n\t' \
    | grep -om1 '"version":"[^"]*"' \
    | cut -d '"' -f4 \
    | sed -e 's/^v//')
fi
# If a version argument was provided, use it.
# Otherwise, use the version we extracted.
declare -r solution_version="${3:-${semantic_version}}"


echo "------------------------------------------------------------------------------"
echo "[Init] Remove any old dist files from previous runs"
echo "------------------------------------------------------------------------------"
rm -rf "$template_dist_dir"
mkdir -p "$template_dist_dir"

rm -rf "$build_dist_dir"
mkdir -p "$build_dist_dir"

rm -rf "$staging_dist_dir"
mkdir -p "$staging_dist_dir"

echo "------------------------------------------------------------------------------"
echo "[Synth] CDK Project"
echo "------------------------------------------------------------------------------"

cd "$source_dir/cdk"
npm install

npm run cdk -- context --clear
npm run synth -- --output="$staging_dist_dir" \
  --context "solution_version=${semantic_version}"

if [ $? -ne 0 ]
then
    echo "******************************************************************************"
    echo "cdk-nag found errors"
    echo "******************************************************************************"
    exit 1
fi

cd "$staging_dist_dir"
rm tree.json manifest.json cdk.out

echo "------------------------------------------------------------------------------"
echo "Run Cdk Helper"
echo "------------------------------------------------------------------------------"
mv VodFoundation.template.json "$template_dist_dir/video-on-demand-on-aws-foundation.template"

node "$template_dir/cdk-solution-helper/index" \
  --bucket_name "${bucket_name}" \
  --solution_name "${solution_name}" \
  --solution_version "${solution_version}"

echo "------------------------------------------------------------------------------"
echo "[Packing] Source code artifacts"
echo "------------------------------------------------------------------------------"
# ... For each asset.* source code artifact in the temporary /staging folder...
cd $staging_dist_dir
for d in `find . -mindepth 1 -maxdepth 1 -type d`; do
    # Rename the artifact, removing the period for handler compatibility
    pfname="$(basename -- $d)"
    fname="$(echo $pfname | sed -e 's/\.//g')"
    mv $d $fname

    # Zip artifacts from asset folder
    cd $fname
    rm -rf node_modules/
    rm -rf coverage/
    npm i --production
    zip -r ../$fname.zip *
    cd ..

    # Copy the zipped artifact from /staging to /regional-s3-assets
    mv $fname.zip $build_dist_dir
done

echo "------------------------------------------------------------------------------"
echo "[Cleanup] Remove temporary files"
echo "------------------------------------------------------------------------------"
rm -rf "$staging_dist_dir"
