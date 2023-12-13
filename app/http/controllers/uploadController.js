const controller = require('./controller');
const _ = require('lodash');
const path=require('path');
const fs = require('fs');
const Media = require('../models/upload');

class uploaderCotroller extends controller {

      // upload image
    async uploadImage(req, res) {
        const {fileType , fileTags} = req.body;
        let uploadPath;

        try {
            if(!req.files) {
                res.send({
                    status: false,
                    message: 'No file uploaded'
                });
            } 
            else {
                let images = req.files.fileImage;
                let name = images.name;
                let md5 = images.md5;
                let ext = name.slice((Math.max(0, name.lastIndexOf(".")) || Infinity) + 1);

                if(fileType == "slidershow") {
                     uploadPath = './myUpload/slidershow/slidershow_' + md5 + "." + ext;
                }
                else {
                    uploadPath = './myUpload/product/product_' + md5 + "." + ext;
                }

                images.mv(uploadPath, function(err) {
                    if (err)
                      return res.status(500).send(err);

                      let newMedia = new Media({ 
                        name: fileType === "product" ? "product_"+ md5 + "." + ext : "slidershow_"+ md5 + "." + ext,
                        type: fileType,
                        tag: fileTags,
                      });
                      newMedia.save(); 

                        //send response
                        res.send({
                            status: 201,
                            result: "success",
                            message: 'File is uploaded',
                            info: {
                                name: "product_"+ md5 + '.' + ext,
                                mimetype: images.mimetype,
                                size: images.size
                            }
                        });
                });
            }
        } 
        catch (err) {
            res.status(500).send(err);
        }
    }

     // get all media
    async mediaList(req , res) {
        let {sort} = req.query;
        try {
            let page = req.query.page || 1;
            let media = await Media.paginate({ type : sort } , { page , sort : { createdAt : 1 } , limit : 12 });
                res.json({
                    data : this.filterMediaData(media),
                    result : 'success',
                    status: 200,
                })
        } 
        catch (err) {
            res.json({
                error: err,
                status: 400,
                result : 'error'
            })
        }
    }

    // get media by tag
    async mediaListByTags(req, res) {
      let {tag} = req.params;
      try {
        const media = await Media.find({ tag: { $eq: tag } });
        res.json({
            images : this.filterMediaByTagData(media),
            result : 'success',
            status: 200,
        });
      } 
      catch (error) {
        res.json({
            error: error,
            status: 400,
            result : 'error'
        })
      }
    }

     // filter media output
    filterMediaData(media) {
        return { 
            ...media,
            docs : media.docs.map(img => {
                return {
                    id : img.id,
                    image : img.name,
                    tag : img.tag
                }
            })
        }
    }

    filterMediaByTagData(media) {
        return { 
            media : media.map(media => {
                return {
                    id : media.id,
                    image : media.name,
                    tag: media.tag
                }
            })
        }
    }


    async destroy(req , res  , next) {
        try {
            let {id} = req.params; 
            let media = await Media.findById(id).exec();
            let fileName = `./myUpload/`+ media.type +"/"+ media.name; 
            if(!media) {
                res.json({
                    massage: "تصویری با شناسه ارسال شده یافت نشد.",
                    result : 'error',
                    status: 500,
                })
            }

            // delete Images
            if (fs.existsSync(fileName)) {
                fs.unlinkSync(fileName)
                media.deleteOne();
                res.json({
                    result : 'success',
                    status: 200,
                })
            }
            else {
                media.deleteOne();
                res.json({
                    massage: "تصویر موجود نبود !",
                    result : 'error',
                    status: 404,
                })
            }
           
        } 
        catch (error) {
            next(error);
        }
    }

}
module.exports = new uploaderCotroller();