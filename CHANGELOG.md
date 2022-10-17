# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2022-10-17
### Added
- AppRegistry Application Stack Association
- Application Insights in AppRegistry
- SonarQube properties file: sonar-project.properties
- Added unit tests with 80% code coverage
### Changed
- Changed deployment/run-unit-tests.sh to generate unit test coverage reports
### Contributors
* @sandimciin
* @eggoynes

## [1.1.0] - 2021-7-29
### Added 
- Added new input file extensions wmv, mxf, mkv, m3u8, mpeg, webm, and h264.
- All file extensions now work in uppercase or lowercase format. Example WMV and wmv now trigger jobs via S3. (https://github.com/awslabs/video-on-demand-on-aws-foundations/issues/8)

### Changed
- New MediaConvert job-settings.json template removing DASH and MP4 renditions to reduce cost. 
    - Pricing savings of 37% by changing default job-settings.json from Professional tier to Basic tier.
    - Deinterlacer setting turned off in job-settings.json so AWS MediaConvert uses Basic Tier and not Professional tier.
    - Default job-settings.json frames per second set to follow source now instead of setting a strict 30 fps.

### Fixed
- Readme file updates. (https://github.com/awslabs/video-on-demand-on-aws-foundations/issues/12)
- Added mock settings for unit tests. (https://github.com/awslabs/video-on-demand-on-aws-foundations/issues/6)
- Added extra steps when building in the Readme file. (https://github.com/awslabs/video-on-demand-on-aws-foundations/issues/4)
- Updated Axios to version 0.21.1

### Contributors
* @eggoynes
## [1.0.0] - 2020-11-05
### Added
- All files, initial version
