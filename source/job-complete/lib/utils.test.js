const cwComplete = {
  version: "0",
  id: "d3116301-c01d-686b-92b2-692d5ae9a0ef",
  "detail-type": "MediaConvert Job State Change",
  source: "aws.mediaconvert",
  account: "123",
  time: "2020-10-13T17:20:21Z",
  region: "us-east-1",
  resources: ["mediaconvert"],
  detail: {
    timestamp: 123,
    accountId: "123",
    queue: "mediaconvert",
    jobId: "12345",
    status: "COMPLETE",
    userMetadata: {
      guid: "12345",
      workflow: "foo-vod",
    },
    outputGroupDetails: [
      {
        outputDetails: [
          {
            outputFilePaths: ["file"],
            durationInMs: 13513,
            videoDetails: {
              widthInPx: 3840,
              heightInPx: 2160,
            },
          },
          {
            outputFilePaths: ["file"],
            durationInMs: 13513,
            videoDetails: {
              widthInPx: 1920,
              heightInPx: 1080,
            },
          },
          {
            outputFilePaths: ["file"],
            durationInMs: 13513,
            videoDetails: {
              widthInPx: 1280,
              heightInPx: 720,
            },
          },
        ],
        type: "FILE_GROUP",
      },
      {
        outputDetails: [
          {
            outputFilePaths: ["file"],
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 480,
              heightInPx: 270,
            },
          },
          {
            outputFilePaths: ["file"],
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 640,
              heightInPx: 360,
            },
          },
          {
            outputFilePaths: ["file"],
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 640,
              heightInPx: 360,
            },
          },
          {
            outputFilePaths: ["file"],
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 960,
              heightInPx: 540,
            },
          },
          {
            outputFilePaths: ["file"],
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 1280,
              heightInPx: 720,
            },
          },
          {
            outputFilePaths: ["file"],
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 1280,
              heightInPx: 720,
            },
          },
          {
            outputFilePaths: ["file"],
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 1280,
              heightInPx: 720,
            },
          },
          {
            outputFilePaths: ["file"],
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 1920,
              heightInPx: 1080,
            },
          },
        ],
        playlistFilePaths: ["file"],
        type: "HLS_GROUP",
      },
      {
        outputDetails: [
          {
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 480,
              heightInPx: 270,
            },
          },
          {
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 640,
              heightInPx: 360,
            },
          },
          {
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 640,
              heightInPx: 360,
            },
          },
          {
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 960,
              heightInPx: 540,
            },
          },
          {
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 1280,
              heightInPx: 720,
            },
          },
          {
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 1280,
              heightInPx: 720,
            },
          },
          {
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 1280,
              heightInPx: 720,
            },
          },
          {
            durationInMs: 13480,
            videoDetails: {
              widthInPx: 1920,
              heightInPx: 1080,
            },
          },
          {
            durationInMs: 13482,
          },
        ],
        playlistFilePaths: ["file"],
        type: "DASH_ISO_GROUP",
      },
      {
        outputDetails: [
          {
            outputFilePaths: ["file"],
            durationInMs: 15000,
            videoDetails: {
              widthInPx: 1280,
              heightInPx: 720,
            },
          },
        ],
        type: "FILE_GROUP",
      },
    ],
  },
};

const jobDetails = {
  Queue: "12345",
  UserMetadata: {
    guid: "5182c04e-7a32-4f57-a711-75438957dd66",
    workflow: "foo-vod",
  },
  Role: "role",
  Settings: {
    TimecodeConfig: {
      Source: "ZEROBASED",
    },
    OutputGroups: [
      {
        Name: "File Group",
        Outputs: [
          {
            Preset: "foo-vod_Mp4_Hevc_Aac_16x9_3840x2160p_24Hz_20Mbps_qvbr",
            Extension: "mp4",
            NameModifier: "_Mp4_Hevc_Aac_16x9_3840x2160p_24Hz_20Mbps_qvbr",
          },
          {
            Preset: "foo-vod_Mp4_Avc_Aac_16x9_1920x1080p_24Hz_6Mbps_qvbr",
            Extension: "mp4",
            NameModifier: "_Mp4_Avc_Aac_16x9_1920x1080p_24Hz_6Mbps_qvbr",
          },
          {
            Preset: "foo-vod_Mp4_Avc_Aac_16x9_1280x720p_24Hz_4.5Mbps_qvbr",
            Extension: "mp4",
            NameModifier: "_Mp4_Avc_Aac_16x9_1280x720p_24Hz_4.5Mbps_qvbr",
          },
        ],
        OutputGroupSettings: {
          Type: "FILE_GROUP_SETTINGS",
          FileGroupSettings: {
            Destination: "file",
          },
        },
      },
      {
        Name: "HLS Group",
        Outputs: [
          {
            Preset:
              "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_480x270p_15Hz_0.4Mbps_qvbr",
            NameModifier: "_Ott_Hls_Ts_Avc_Aac_16x9_480x270p_15Hz_0.4Mbps_qvbr",
          },
          {
            Preset:
              "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_640x360p_30Hz_0.6Mbps_qvbr",
            NameModifier: "_Ott_Hls_Ts_Avc_Aac_16x9_640x360p_30Hz_0.6Mbps_qvbr",
          },
          {
            Preset:
              "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_640x360p_30Hz_1.2Mbps_qvbr",
            NameModifier: "_Ott_Hls_Ts_Avc_Aac_16x9_640x360p_30Hz_1.2Mbps_qvbr",
          },
          {
            Preset:
              "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_960x540p_30Hz_3.5Mbps_qvbr",
            NameModifier: "_Ott_Hls_Ts_Avc_Aac_16x9_960x540p_30Hz_3.5Mbps_qvbr",
          },
          {
            Preset:
              "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_3.5Mbps_qvbr",
            NameModifier:
              "_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_3.5Mbps_qvbr",
          },
          {
            Preset:
              "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_5.0Mbps_qvbr",
            NameModifier:
              "_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_5.0Mbps_qvbr",
          },
          {
            Preset:
              "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_6.5Mbps_qvbr",
            NameModifier:
              "_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_6.5Mbps_qvbr",
          },
          {
            Preset:
              "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_1920x1080p_30Hz_8.5Mbps_qvbr",
            NameModifier:
              "_Ott_Hls_Ts_Avc_Aac_16x9_1920x1080p_30Hz_8.5Mbps_qvbr",
          },
        ],
        OutputGroupSettings: {
          Type: "HLS_GROUP_SETTINGS",
          HlsGroupSettings: {
            ManifestDurationFormat: "INTEGER",
            SegmentLength: 5,
            TimedMetadataId3Period: 10,
            CaptionLanguageSetting: "OMIT",
            Destination: "file",
            TimedMetadataId3Frame: "PRIV",
            CodecSpecification: "RFC_4281",
            OutputSelection: "MANIFESTS_AND_SEGMENTS",
            ProgramDateTimePeriod: 600,
            MinSegmentLength: 0,
            DirectoryStructure: "SINGLE_DIRECTORY",
            ProgramDateTime: "EXCLUDE",
            SegmentControl: "SEGMENTED_FILES",
            ManifestCompression: "NONE",
            ClientCache: "ENABLED",
            StreamInfResolution: "INCLUDE",
          },
        },
      },
      {
        Name: "DASH ISO",
        Outputs: [
          {
            Preset: "foo-vod_Ott_Dash_Mp4_Avc_16x9_480x270p_15Hz_0.4Mbps_qvbr",
            NameModifier: "_Ott_Dash_Mp4_Avc_16x9_480x270p_15Hz_0.4Mbps_qvbr",
          },
          {
            Preset: "foo-vod_Ott_Dash_Mp4_Avc_16x9_640x360p_30Hz_0.6Mbps_qvbr",
            NameModifier: "_Ott_Dash_Mp4_Avc_16x9_640x360p_30Hz_0.6Mbps_qvbr",
          },
          {
            Preset: "foo-vod_Ott_Dash_Mp4_Avc_16x9_640x360p_30Hz_1.2Mbps_qvbr",
            NameModifier: "_Ott_Dash_Mp4_Avc_16x9_640x360p_30Hz_1.2Mbps_qvbr",
          },
          {
            Preset: "foo-vod_Ott_Dash_Mp4_Avc_16x9_960x540p_30Hz_3.5Mbps_qvbr",
            NameModifier: "_Ott_Dash_Mp4_Avc_16x9_960x540p_30Hz_3.5Mbps_qvbr",
          },
          {
            Preset: "foo-vod_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_3.5Mbps_qvbr",
            NameModifier: "_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_3.5Mbps_qvbr",
          },
          {
            Preset: "foo-vod_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_5.0Mbps_qvbr",
            NameModifier: "_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_5.0Mbps_qvbr",
          },
          {
            Preset: "foo-vod_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_6.5Mbps_qvbr",
            NameModifier: "_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_6.5Mbps_qvbr",
          },
          {
            Preset:
              "foo-vod_Ott_Dash_Mp4_Avc_16x9_1920x1080p_30Hz_8.5Mbps_qvbr",
            NameModifier: "_Ott_Dash_Mp4_Avc_16x9_1920x1080p_30Hz_8.5Mbps_qvbr",
          },
          {
            Preset: "System-Ott_Dash_Mp4_Aac_He_96Kbps",
            NameModifier: "_Ott_Dash_Mp4_Aac_He_96Kbps",
          },
        ],
        OutputGroupSettings: {
          Type: "DASH_ISO_GROUP_SETTINGS",
          DashIsoGroupSettings: {
            SegmentLength: 30,
            Destination: "file",
            FragmentLength: 3,
            SegmentControl: "SEGMENTED_FILES",
            HbbtvCompliance: "NONE",
          },
        },
      },
      {
        CustomName: "Frame Capture",
        Name: "File Group",
        Outputs: [
          {
            ContainerSettings: {
              Container: "RAW",
            },
            VideoDescription: {
              ScalingBehavior: "DEFAULT",
              TimecodeInsertion: "DISABLED",
              AntiAlias: "ENABLED",
              Sharpness: 100,
              CodecSettings: {
                Codec: "FRAME_CAPTURE",
                FrameCaptureSettings: {
                  FramerateNumerator: 1,
                  FramerateDenominator: 5,
                  MaxCaptures: 10000000,
                  Quality: 80,
                },
              },
              AfdSignaling: "NONE",
              DropFrameTimecode: "ENABLED",
              RespondToAfd: "NONE",
              ColorMetadata: "INSERT",
            },
            NameModifier: "_thumb",
          },
        ],
        OutputGroupSettings: {
          Type: "FILE_GROUP_SETTINGS",
          FileGroupSettings: {
            Destination: "file",
          },
        },
      },
    ],
    AdAvailOffset: 0,
    Inputs: [
      {
        AudioSelectors: {
          "Audio Selector 1": {
            Tracks: [1],
            Offset: 0,
            DefaultSelection: "NOT_DEFAULT",
            SelectorType: "TRACK",
            ProgramSelection: 1,
          },
        },
        VideoSelector: {
          ColorSpace: "FOLLOW",
          Rotate: "DEGREE_0",
        },
        FilterEnable: "AUTO",
        PsiControl: "USE_PSI",
        FilterStrength: 0,
        DeblockFilter: "DISABLED",
        DenoiseFilter: "DISABLED",
        TimecodeSource: "ZEROBASED",
        FileInput: "file",
      },
    ],
  },
  AccelerationSettings: {
    Mode: "PREFERRED",
  },
  StatusUpdateInterval: "SECONDS_60",
  Priority: 0,
};

const snsData = {
  Id: "123",
  Job: {
    detail: {
      jobId: "123",
    },
  },
  OutputGroupDetails: {},
  InputDetails: {},
  detail: {
    jobId: "123"
  }
};

const metricsData = {
  Id: "132313",
  Job: {
    Queue: "queues/Default",
    UserMetadata: {
      guid: "5182c04e-7a32-4f57-a711-75438957dd66",
      workflow: "foo-vod",
    },
    Role: "arn",
    Settings: {
      TimecodeConfig: {
        Source: "ZEROBASED",
      },
      OutputGroups: [
        {
          Name: "File Group",
          Outputs: [
            {
              Preset: "foo-vod_Mp4_Hevc_Aac_16x9_3840x2160p_24Hz_20Mbps_qvbr",
              Extension: "mp4",
              NameModifier: "_Mp4_Hevc_Aac_16x9_3840x2160p_24Hz_20Mbps_qvbr",
            },
            {
              Preset: "foo-vod_Mp4_Avc_Aac_16x9_1920x1080p_24Hz_6Mbps_qvbr",
              Extension: "mp4",
              NameModifier: "_Mp4_Avc_Aac_16x9_1920x1080p_24Hz_6Mbps_qvbr",
            },
            {
              Preset: "foo-vod_Mp4_Avc_Aac_16x9_1280x720p_24Hz_4.5Mbps_qvbr",
              Extension: "mp4",
              NameModifier: "_Mp4_Avc_Aac_16x9_1280x720p_24Hz_4.5Mbps_qvbr",
            },
          ],
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: "file",
            },
          },
        },
        {
          Name: "HLS Group",
          Outputs: [
            {
              Preset:
                "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_480x270p_15Hz_0.4Mbps_qvbr",
              NameModifier:
                "_Ott_Hls_Ts_Avc_Aac_16x9_480x270p_15Hz_0.4Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_640x360p_30Hz_0.6Mbps_qvbr",
              NameModifier:
                "_Ott_Hls_Ts_Avc_Aac_16x9_640x360p_30Hz_0.6Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_640x360p_30Hz_1.2Mbps_qvbr",
              NameModifier:
                "_Ott_Hls_Ts_Avc_Aac_16x9_640x360p_30Hz_1.2Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_960x540p_30Hz_3.5Mbps_qvbr",
              NameModifier:
                "_Ott_Hls_Ts_Avc_Aac_16x9_960x540p_30Hz_3.5Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_3.5Mbps_qvbr",
              NameModifier:
                "_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_3.5Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_5.0Mbps_qvbr",
              NameModifier:
                "_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_5.0Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_6.5Mbps_qvbr",
              NameModifier:
                "_Ott_Hls_Ts_Avc_Aac_16x9_1280x720p_30Hz_6.5Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Hls_Ts_Avc_Aac_16x9_1920x1080p_30Hz_8.5Mbps_qvbr",
              NameModifier:
                "_Ott_Hls_Ts_Avc_Aac_16x9_1920x1080p_30Hz_8.5Mbps_qvbr",
            },
          ],
          OutputGroupSettings: {
            Type: "HLS_GROUP_SETTINGS",
            HlsGroupSettings: {
              ManifestDurationFormat: "INTEGER",
              SegmentLength: 5,
              TimedMetadataId3Period: 10,
              CaptionLanguageSetting: "OMIT",
              Destination: "file",
              TimedMetadataId3Frame: "PRIV",
              CodecSpecification: "RFC_4281",
              OutputSelection: "MANIFESTS_AND_SEGMENTS",
              ProgramDateTimePeriod: 600,
              MinSegmentLength: 0,
              DirectoryStructure: "SINGLE_DIRECTORY",
              ProgramDateTime: "EXCLUDE",
              SegmentControl: "SEGMENTED_FILES",
              ManifestCompression: "NONE",
              ClientCache: "ENABLED",
              StreamInfResolution: "INCLUDE",
            },
          },
        },
        {
          Name: "DASH ISO",
          Outputs: [
            {
              Preset:
                "foo-vod_Ott_Dash_Mp4_Avc_16x9_480x270p_15Hz_0.4Mbps_qvbr",
              NameModifier: "_Ott_Dash_Mp4_Avc_16x9_480x270p_15Hz_0.4Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Dash_Mp4_Avc_16x9_640x360p_30Hz_0.6Mbps_qvbr",
              NameModifier: "_Ott_Dash_Mp4_Avc_16x9_640x360p_30Hz_0.6Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Dash_Mp4_Avc_16x9_640x360p_30Hz_1.2Mbps_qvbr",
              NameModifier: "_Ott_Dash_Mp4_Avc_16x9_640x360p_30Hz_1.2Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Dash_Mp4_Avc_16x9_960x540p_30Hz_3.5Mbps_qvbr",
              NameModifier: "_Ott_Dash_Mp4_Avc_16x9_960x540p_30Hz_3.5Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_3.5Mbps_qvbr",
              NameModifier:
                "_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_3.5Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_5.0Mbps_qvbr",
              NameModifier:
                "_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_5.0Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_6.5Mbps_qvbr",
              NameModifier:
                "_Ott_Dash_Mp4_Avc_16x9_1280x720p_30Hz_6.5Mbps_qvbr",
            },
            {
              Preset:
                "foo-vod_Ott_Dash_Mp4_Avc_16x9_1920x1080p_30Hz_8.5Mbps_qvbr",
              NameModifier:
                "_Ott_Dash_Mp4_Avc_16x9_1920x1080p_30Hz_8.5Mbps_qvbr",
            },
            {
              Preset: "System-Ott_Dash_Mp4_Aac_He_96Kbps",
              NameModifier: "_Ott_Dash_Mp4_Aac_He_96Kbps",
            },
          ],
          OutputGroupSettings: {
            Type: "DASH_ISO_GROUP_SETTINGS",
            DashIsoGroupSettings: {
              SegmentLength: 30,
              Destination: "file",
              FragmentLength: 3,
              SegmentControl: "SEGMENTED_FILES",
              HbbtvCompliance: "NONE",
            },
          },
        },
        {
          CustomName: "Frame Capture",
          Name: "File Group",
          Outputs: [
            {
              ContainerSettings: {
                Container: "RAW",
              },
              VideoDescription: {
                ScalingBehavior: "DEFAULT",
                TimecodeInsertion: "DISABLED",
                AntiAlias: "ENABLED",
                Sharpness: 100,
                CodecSettings: {
                  Codec: "FRAME_CAPTURE",
                  FrameCaptureSettings: {
                    FramerateNumerator: 1,
                    FramerateDenominator: 5,
                    MaxCaptures: 10000000,
                    Quality: 80,
                  },
                },
                AfdSignaling: "NONE",
                DropFrameTimecode: "ENABLED",
                RespondToAfd: "NONE",
                ColorMetadata: "INSERT",
              },
              NameModifier: "_thumb",
            },
          ],
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: "file",
            },
          },
        },
      ],
      AdAvailOffset: 0,
      Inputs: [
        {
          AudioSelectors: {
            "Audio Selector 1": {
              Tracks: [1],
              Offset: 0,
              DefaultSelection: "NOT_DEFAULT",
              SelectorType: "TRACK",
              ProgramSelection: 1,
            },
          },
          VideoSelector: {
            ColorSpace: "FOLLOW",
            Rotate: "DEGREE_0",
          },
          FilterEnable: "AUTO",
          PsiControl: "USE_PSI",
          FilterStrength: 0,
          DeblockFilter: "DISABLED",
          DenoiseFilter: "DISABLED",
          TimecodeSource: "ZEROBASED",
          FileInput: "file",
        },
      ],
    },
    AccelerationSettings: {
      Mode: "PREFERRED",
    },
    StatusUpdateInterval: "SECONDS_60",
    Priority: 0,
  },
  InputDetails: {
    uri: "uri",
  },
  Outputs: {},
  Inputs: {
    version: "0",
    id: "09b6e189-4d35-5d47-4403-a7a4155ee3c9",
    "detail-type": "MediaConvert Job State Change",
    source: "aws.mediaconvert",
    account: "1234",
    time: "2020-10-12T13:01:25Z",
    region: "us-east-2",
    resources: ["arn"],
    detail: {
      timestamp: 1234,
      accountId: "1234",
      queue: "arn",
      jobId: "1234",
      status: "INPUT_INFORMATION",
      userMetadata: {
        guid: "391d00eb-0639-420f-b952-97fd4bf3575f",
        workflow: "foo-space",
        solutionId: "SO0146",
      },
      inputDetails: [
        {
          audio: [
            {
              channels: 2,
              codec: "MP2",
              language: "UNK",
              sampleRate: 48000,
              streamId: 448,
            },
          ],
          id: 1,
          uri: "file",
          video: [
            {
              bitDepth: 8,
              codec: "MPEG1",
              colorFormat: "YUV_420",
              fourCC: "FOURCC_AUTO",
              frameRate: 25,
              height: 720,
              interlaceMode: "PROGRESSIVE",
              sar: "1:1",
              standard: "UNSPECIFIED",
              streamId: 480,
              width: 1280,
            },
          ],
        },
      ],
    },
  },
};

module.exports = {
  jobDetails: jobDetails,
  cwComplete: cwComplete,
  snsData: snsData,
  metricsData: metricsData,
};
