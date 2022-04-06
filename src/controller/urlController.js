
const shortid = require('shortid')


const urlModel = require('../models/urlModel')

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };
  
  const isValidUrl=/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
  
  
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

       const isUrlCodePresent=await urlModel.findOne({urlCode:urlCode})

        if(!isUrlCodePresent){
            res.status(404).send({status:false, message:"Url not found this urlCode"})
        }
        res.status(302).redirect(isUrlCodePresent.longUrl)
    } catch (err) {
        res.status(500).send({status:false, message:err.message})
    }
}
module.exports = {createUrl, getCode}