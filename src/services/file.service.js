const express = require('express');
const auth = require('../middlewares/auth');
const fs = require('fs');
const logger = require('../config/logger');
const piexif = require('piexifjs');

const storage_path = 'uploads';
let _route = '';

const registerMiddleware = (route,app) => {
    app.use(route+'/public', express.static(storage_path+'/public'));
    app.use(route+'/private/all', auth());
    app.use(route+'/private/all', express.static(storage_path+'/private/all'));
    app.use(route+'/private/admin', auth('admin'));
    app.use(route+'/private/admin', express.static(storage_path+'/private/admin'));
    app.use(route+'/private/user/:id', auth());
    app.use(route+'/private/user/:id',(req, res, next) => {
        if(req.params.id === req.user.id || req.user.role === 'admin'){
            next();
        }
        else{
            res.status(403).send({
                status: 403,
                message: "Unauthorized request"
            });
        }
    });
    app.use(route+'/private/user/:id', express.static('uploads/private/user'));
    _route = route;
}

const saveFile = (file, key, type, userId) => {
    //piexif.remove();///Remove exif data
    if(type === 'public'){
        file.mv("./"+storage_path+"/public/"+key);
        return _route + "/public/" + key;
    } else if(type === 'private'){
        file.mv("./"+storage_path+"/private/all/"+userId+"/"+key);
        return _route + "/private/all/" + userId + "/" + key;
    } else if(type === 'admin'){
        file.mv("./"+storage_path+"/private/admin/"+key);
        return _route + "/private/admin/" + key;
    }
    return "";
}

const deleteFile = (url) => {
    if(!url.startsWith(_route)){
        //error
        return false;
    }
    let path = storage_path + url.slice(_route.length);
    try{
        fs.unlinkSync(path);
        return true;
    }
    catch(e){
        logger.error(e);
        return false;
    }
}

module.exports = {
    registerMiddleware,
    saveFile,
    deleteFile
}