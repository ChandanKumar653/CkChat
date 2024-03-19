const aws = require("aws-sdk");
const dynamodb = new aws.DynamoDB.DocumentClient();
var s3 = new aws.S3();

exports.handler = async (event) => {
  try {
    console.log(event);
    if (
      !Array.isArray(event["tags"]) ||
      !event["tags"].length ||
      !Array.isArray(event["images"])
    ) {
      return {
        statusCode: 400,
        body: "Tags & images should be in array and tags can't be empty",
      };
    }

    var imageUrl = [];
    if (event["images"] && event["images"].length) {
      for (let i = 0; i < event["images"].length; i++) {
        // console.log(event['images']);
        console.log(event["images"][i]["name"]);
        if (
          event["images"][i]["name"] !== "" &&
          event["images"][i]["base64"] !== ""
        ) {
          console.log("under call");
          let link = await uploadImage(
            event["images"][i]["name"],
            event["images"][i]["base64"]
          );
          console.log(link);
          if (!link.status) {
            return {
              statusCode: 500,
              body: "Error uploading images: " + link.message,
            };
          } else {
            console.log(link.link);
            imageUrl.push(link.link);
          }
        }
      }
    }
    const params = {
      TableName: "news",
      Item: {
        id: Math.random() + Math.random() + Date.now(),
        tags: event["tags"],
        title: event["title"],
        description: event["description"],
        images: imageUrl,
        dateTime: new Date().toLocaleString(),
        pk: "1",
        tstamp: Number(Date.now()),
      },
    };
    console.log(params);

    try {
      await dynamodb.put(params).promise();
    } catch (e) {
      return {
        statusCode: 500,
        body: "Error adding news: " + e.message,
      };
    }

    return {
      statusCode: 200,
      body: "News added successfully",
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: e.message,
    };
  }
};

async function uploadImage(name, image) {
  try {
    var bucket = "orange-media";

    const decode = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    // console.log(decode, "decode at 178");
    // console.log(name,"name at 179");
    var file = "newsImages/" + Math.random() + name;
    //  console.log(file,"file at 181");
    var bucketParams = {
      Bucket: bucket,
      Key: file,
      Body: decode,
      ContentEncoding: "base64",
      ContentType: "image/jpeg/jpg/png",
    };
    console.log(bucketParams);
    let link = await s3.upload(bucketParams).promise();
    //console.log(link);
    return { link: link["Location"], status: true };
  } catch (e) {
    return e.message;
  }
}
