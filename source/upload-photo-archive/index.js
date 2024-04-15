import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import https from 'https';

const region = { region: process.env.AWS_REGION }

const s3 = new S3Client(region);
const secretsManagerClient = new SecretsManagerClient(region);

export const handler = async (event, context) => {
  
  const getSecret = async () => {
    const secretName = process.env.SECRET_NAME;
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
  const jwt_token = JSON.parse(secret_token);
  const token = jwt_token["jwt_token"];

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

  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const getJSON = new GetObjectCommand({
    Bucket: srcBucket,
    Key: srcKey
  });

  try {
    const response = await s3.send(getJSON);
    const responsebody = await response.Body.transformToString();
    const body = JSON.parse(responsebody);
    for(let i = 0; i < body.length; i++) {
      let item = body[i];
      //console.log('EACH Object:', item);
      var imgfilekey = item.clipid + '.jpg';
      var imgfileput = item.siteid + '/' + item.clipid + '.jpg';
      const getImage = new GetObjectCommand({
        Bucket: srcBucket, 
        Key: imgfilekey
      });
      await s3.send(getImage);
      const cpSource = '/' + srcBucket + '/' + imgfilekey;
      const putImage = new CopyObjectCommand({
        Bucket: process.env.BUCKET_ARCHIVE,
        Key: imgfileput,
        CopySource: cpSource,
      });
      await s3.send(putImage);
      const deleteImage = new DeleteObjectCommand({
        Bucket: srcBucket,
        Key: imgfilekey
      });
      await s3.send(deleteImage);
      console.log('Successfully moved ' + srcBucket + '/' + imgfilekey + ' to ' + process.env.BUCKET_ARCHIVE + '/' + imgfilekey);
      item.poster_url = process.env.CDN_HOST + '/' + item.siteid + '/' + imgfilekey;
      item.download_url = process.env.CDN_HOST + '/' + item.siteid + '/' + imgfilekey;
  
      await doPostRequest(JSON.stringify(item));
    }
  } catch (err) {
    console.log(err);
    const message = `Error somewhere in the process, contact a developer to .`;
    console.log(message);
    throw new Error(message);
  }
};
