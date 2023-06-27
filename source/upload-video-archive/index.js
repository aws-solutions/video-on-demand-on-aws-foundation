const https = require('https');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { S3Client, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");
const { MediaConvertClient, ListJobsCommand, paginateListJobs } = require("@aws-sdk/client-mediaconvert");
const path = require('path');

const region = process.env.AWS_REGION;

const secretsManagerConfig = {
  region: process.env.AWS_REGION,
}
const secretsManagerClient = new SecretsManagerClient(secretsManagerConfig);

const mediaConvertConfig = {
  region: process.env.AWS_REGION,
  endpoint: process.env.MEDIACONVERT_ENDPOINT
}
const mediaConvertClient = new MediaConvertClient(mediaConvertConfig);

const s3Config = {
  region: process.env.AWS_REGION,
  //endpoint: ""
}
const s3Client = new S3Client(s3Config);


const sesConfig = {
  region: process.env.AWS_REGION,
  //endpoint: ""
}
const sesClient = new SESv2Client(sesConfig);

// Lambda Handler
exports.LambdaHandler = async (event, ctx, callback) => {
  // Secrets Manager
  const getSecret = async () => {
    const secretName = process.env.SECRET_NAME;
    // console.log("secretName: ", secretName);
    const secretsManagerClient = new SecretsManagerClient(secretsManagerConfig);
    const secretsManagerCommand = new GetSecretValueCommand({ SecretId: secretName });

    try {
      const secretsManagerResponse = await secretsManagerClient.send(secretsManagerCommand);
      return secretsManagerResponse;
    } catch (error) {
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      throw error;
    }
  }
  const secret = await getSecret();
  const secret_token = secret.SecretString;
  // Parse jwt_token as JSON object
  const jwt_token = JSON.parse(secret_token);
  const token = jwt_token["jwt_token"];

  // WordPress POST function
  const doPostRequest = (data) => {
    return new Promise((resolve, reject) => {
      const options = {
        host: process.env.HOST,
        path: process.env.URL_PATH,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
      };
      console.dir(options)
      //console.dir(data)
      const req = https.request(options, (res) => {
        console.log({ res });
        resolve(JSON.stringify(res.statusCode));
      });
      req.on('error', (e) => {
        reject(e.message);
        console.log(e.message);
      });
      req.write(data);
      req.end();
    });
  };

  const s3HeadCheck = async (bucket, key) => {
    const s3Config = {
      region: process.env.AWS_REGION,
      //endpoint: ""
    }
    const s3Client = new S3Client(s3Config);
    const s3HeadObjectCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
    try {
      const s3HeadObjectResponse = await s3Client.send(s3HeadObjectCommand);
      return s3HeadObjectResponse;
    } catch (err) {
      return;
    }
  }

  const getMediaConvertJobs = async (pageToken) => {
    // MediaConvert API
    try {
      //const pageToken = event.queryStringParameters?.pageToken;

      const mediaConvertResults = await mediaConvertClient.send(new ListJobsCommand({
        MaxResults: 20,
        ...pageToken && { NextToken: pageToken }
      }));

      const jobs = mediaConvertResults.Jobs.map(job => {
        // This feels a bit hacky, but it works
        for (i = 0; i < job.Settings.OutputGroups.length; ++i) {
          if (job.Settings.OutputGroups[i].Name == 'Apple HLS') {
            s3URL = job.Settings.OutputGroups[i].OutputGroupSettings.HlsGroupSettings.Destination.split("/");
            destination = s3URL;
            destination.pop(); // remove last element caused by trailing slash
          }
          if (job.Settings.OutputGroups[i].Name == 'File Group' && job.Settings.OutputGroups[i].Outputs[0].ContainerSettings.Container == 'MP4') {
            downloadNameModifier = job.Settings.OutputGroups[i].Outputs[0].NameModifier;
          }
        }
        destination = destination.pop();
        for (i = 0; i < job.Settings.Inputs.length; ++i) {
          videoFile = job.Settings.Inputs[i].FileInput.split("/");
        }
        videoFile = videoFile.pop();
        videoFile = videoFile.split(".");

        videoFile = videoFile[0];

        return {
          id: job.Id,
          status: job.Status,
          bucket: s3URL[2],
          input: videoFile,
          output: job.UserMetadata.Guid + "/" + videoFile,
          downloadname: downloadNameModifier
        }
      });

      const mediaConvertResponse = {
        jobs,
        ...mediaConvertResults.NextToken && { pageToken: mediaConvertResults.NextToken }
      };
      //console.log(JSON.stringify(mediaConvertResponse))
      return mediaConvertResponse;
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'MediaConvert error: ' + err })
      };
    }
  };
  const mediaConvertJobs = await getMediaConvertJobs();
  const mediaConvertJobs2 = await getMediaConvertJobs(mediaConvertJobs.pageToken);
  mediaConvertJobs.jobs = mediaConvertJobs.jobs.concat(mediaConvertJobs2.jobs);
  const mediaConvertJobs3 = await getMediaConvertJobs(mediaConvertJobs2.pageToken);
  mediaConvertJobs.jobs = mediaConvertJobs.jobs.concat(mediaConvertJobs3.jobs);
  const mediaConvertJobs4 = await getMediaConvertJobs(mediaConvertJobs3.pageToken);
  mediaConvertJobs.jobs = mediaConvertJobs.jobs.concat(mediaConvertJobs4.jobs);
  const mediaConvertJobs5 = await getMediaConvertJobs(mediaConvertJobs4.pageToken);
  mediaConvertJobs.jobs = mediaConvertJobs.jobs.concat(mediaConvertJobs5.jobs);
  const mediaConvertJobs6 = await getMediaConvertJobs(mediaConvertJobs5.pageToken);
  mediaConvertJobs.jobs = mediaConvertJobs.jobs.concat(mediaConvertJobs6.jobs);
  const mediaConvertJobs7 = await getMediaConvertJobs(mediaConvertJobs6.pageToken);
  mediaConvertJobs.jobs = mediaConvertJobs.jobs.concat(mediaConvertJobs7.jobs);
 
  //  S3 API
  const s3Params = {
    Bucket: event.Records[0].s3.bucket.name,
    Key: decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
  };
  const s3Command = new GetObjectCommand(s3Params);
  const s3Response = await s3Client.send(new GetObjectCommand(s3Params));
  const s3Body = await s3Response.Body.transformToString();


  try {
    const obj = JSON.parse(s3Body);
    for (i = 0; i < obj.length; ++i) {
      for (j = 0; j < mediaConvertJobs.jobs.length; ++j) {
        if (mediaConvertJobs.jobs[j].status == "COMPLETE") {
          if (obj[i].video == mediaConvertJobs.jobs[j].input) {
            playlistURL = mediaConvertJobs.jobs[j].output + ".m3u8";
            posterURL = mediaConvertJobs.jobs[j].output + "_poster.0000002.jpg";
            downloadURL = mediaConvertJobs.jobs[j].output + mediaConvertJobs.jobs[j].downloadname + ".mp4";
            s3HeadCheckResponse = await s3HeadCheck(mediaConvertJobs.jobs[j].bucket, playlistURL);
            if (typeof s3HeadCheckResponse !== 'undefined') {
              console.dir("Found Video! " + obj[i].video + " " + mediaConvertJobs.jobs[j].input + " " + downloadURL);
              const item = obj[i];
              item.video_url = playlistURL;
              item.poster_url = posterURL;
              item.download_url = downloadURL;
              item.vtt_url = "";
              console.dir(item);
              const resp = await doPostRequest(JSON.stringify(item));
              console.dir(resp);
            }
          }
        }
      }
    }
  } catch (err) {
    var errmsg = Error(err);
    var email = {
      Destination: {
        ToAddresses: [process.env.EMAIL_RECIPIENTS],
      },
      Content: {
        Body: {
          Text: { Data: errmsg.message },
        },
        Subject: { Data: "Error with your JSON upload" },
      },
      FromEmailAddress: process.env.EMAIL_SENDER,
    };
    //  await sesClient.sendEmail(email).promise();
    // const sesCommand = new SendEmailCommand(email);
    // const sesResponse = await sesClient.send(sesCommand);
    // ses.sendEmail(email).promise();
    // callback(Error(err));
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'S3 error: ' + err })
    };
  }

  return {
    statusCode: 200,
    //body: JSON.stringify(obj)
  }

}