
const shortid = require('shortid')
const redis = require("redis");

const { promisify } = require("util");

const urlModel = require('../models/urlModel')





const redisClient = redis.createClient(
    11776,
    "redis-11776.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("rrusW4ZeE0cu5CrGRtdoK63RlMMPkL3G", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  
  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
  const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
  
  const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };
  

  const isValidUrl=/http(s?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
  
  
  const createUrl = async function (req, res) {
    try {
        const longUrl=req.body.longUrl
        const baseUrl="http://localhost:3000"
  
        if (!isValid(longUrl)) {
          res.status(400).send({ status: false, message: "URL is required" });
          return;
        }
  
      if(!isValidUrl.test(longUrl)) {
          res.status(400).send({ status: false, msg: "Plz enter valid URL" });
          return;
          }
          const isUrlPresent = await urlModel.findOne({longUrl:longUrl}).select({createdAt: 0,updatedAt: 0,__v:0,_id:0})
    if(isUrlPresent){
        res.status(200).send({status:true, message:"Short URL already created for this provide Long URL", data:isUrlPresent})
        return
    }
        const urlCode=shortid.generate()
        const shortUrl=baseUrl+ '/' +urlCode
        console.log(shortid.generate());
  
       const urlCreated=await urlModel.create({
            urlCode,
            longUrl,
            shortUrl
        
        })
  
        res.status(201).send({status:true, message:"Short Url created successfully!",data:urlCreated})
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };


  const getCode=async function(req,res){   
    try {
        let urlCode=req.params.urlCode
        
        isUrlCodePresent=await urlModel.findOne({urlCode:urlCode})
        
        if (urlCode.trim().length==0) {
            res.status(400).send({ status: false, message: "plz provide URL Code in params" });
            return;
        }

        if(!isUrlCodePresent){
            res.status(404).send({status:false, message:"Url not found with this urlCode"})
            return
        }

        let cahcedUrlData = await GET_ASYNC(`${req.params.urlCode}`)
        if(cahcedUrlData) {
            res.redirect(JSON.parse(cahcedUrlData).longUrl)
          }else{
              await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(isUrlCodePresent))
              res.redirect(isUrlCodePresent.longUrl)
          }
    } catch (err) {
        res.status(500).send({status:false, message:err.message})
    }
}
module.exports = {createUrl, getCode}