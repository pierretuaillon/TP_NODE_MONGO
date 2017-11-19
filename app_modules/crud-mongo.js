"use strict"

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var assert = require('assert');
var url = 'mongodb://localhost:27017/test';

exports.connexionMongo = function(callback) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		callback(err, db);
	});
}

exports.findRestaurants = function(page, pagesize, callback) {
    MongoClient.connect(url, function(err, db) {
    	    console.log("pagesize = " + pagesize);
    	    console.log("page = " + pagesize);

        if(!err){
            db.collection('restaurants')
            .find()
            .skip(page*pagesize)
            .limit(pagesize)
            .toArray()
            .then(arr => callback(arr));
        }
        else{
            callback(-1);
        }
    });
};
exports.countRestaurants = function(callback) {
	console.log("DANS COUNT")
	MongoClient.connect(url, function(err, db) {
		db.collection('restaurants')
		.count(function(err, res) {
			console.log("COUNT = " + res)
			callback(res);
		});
	});
};

exports.findRestaurantsByName = function(nom,page, pagesize, callback) {
    MongoClient.connect(url, function(err, db) {
    	    console.log("pagesize = " + pagesize);
    	    console.log("page = " + page);
    console.log("FIND BY NAME nom=" + nom);

    	// syntaxe recommandée
    	// Cf doc mongodb: https://docs.mongodb.com/manual/reference/operator/query/regex/
    	// The $regex value needs to be either the string 
    	// pattern to match or a regular expression object. 
    	// When passing a string pattern, you don't include 
    	// the / delimitters
    	// VERSION avec $regexp et $options
    	let myquery = {
    		"name": {
    			$regex: ".*" + nom + ".*", 
    			$options:"i"
    		}
    	}

    	// VERSION avec objet RegExp
    	//let myquery =  {'name' : new RegExp('^.*'+nom+'.*$',"i")};
    	// ou, si on veut être "case sensitive"  
    	//let myquery =  {'name' : new RegExp('^.*'+nom+'.*$')};
        if(!err){
            db.collection('restaurants')
            .find(myquery)
            .skip(page*pagesize)
            .limit(pagesize)
            .toArray()
            .then(arr => callback(arr));
        }
        else{
            callback(-1);
        }
    });
};
exports.findRestaurantById = function(id, callback) {
    MongoClient.connect(url, function(err, db) {
        if(!err) {
        	// La requete mongoDB

            let myquery = { "_id": ObjectId(id)};

            db.collection("restaurants") 
            .findOne(myquery, function(err, data) {
            	let reponse;

                if(!err){
                    reponse = {
                    	succes: true,
                        restaurant : data,
                        error : null,
                        msg:"Details du restaurant envoyés"
                    };
                } else{
                    reponse = {
                    	succes: false,
                        restaurant : null,
                        error : err,
                        msg: "erreur lors du find"

                    };
                }
                callback(reponse);
            });
        } else {
        	let reponse = reponse = {
                    	succes: false,
                        restaurant : null,
                        error : err,
                        msg: "erreur de connexion à la base"
                    };
            callback(reponse);
        }
    });
}

exports.createRestaurant = function(formData, callback) {
	MongoClient.connect(url, function(err, db) {
	    if(!err) {
	 
			let toInsert = {
				name : formData.nom, 
				cuisine : formData.cuisine
			};
			console.dir(JSON.stringify(toInsert));
		    db.collection("restaurants")
		    .insertOne(toInsert, function(err, result) {
		    	let reponse;

		        if(!err){
		            reponse = {
		                succes : true,
		                result: result,
		                error : null,
		                msg: "Ajout réussi " + result
		            };
		        } else {
		            reponse = {
		                succes : false,
		                error : err,
		                msg: "Problème à l'insertion"
		            };
		        }
		        callback(reponse);
		    });
		} else{
			let reponse = reponse = {
                    	succes: false,
                        error : err,
                        msg:"Problème lors de l'insertion, erreur de connexion."
                    };
            callback(reponse);
		}
	});
}

exports.updateRestaurant = function(id, formData, callback) {
	MongoClient.connect(url, function(err, db) {
		if(!err) {
            let myquery = { "_id": ObjectId(id)};
	        let newvalues = {
	        	name : formData.nom, 
	        	cuisine : formData.cuisine
	        };


			db.collection("restaurants")
			.updateOne(myquery, newvalues, function(err, result) {
	         	if(!err){
			    	reponse = {
		                succes : true,
		                result: result,
		                error : null,
		                msg: "Modification réussie " + result
		            };
			   	} else {
		            reponse = {
		                succes : false,
		                error : err,
		                msg: "Problème à la modification"
		            };
			    }
			    callback(reponse);
	        });
		} else{
			let reponse = reponse = {
                    	succes: false,
                        error : err,
                        msg:"Problème lors de la modification, erreur de connexion."
                    };
            callback(reponse);
		}
	});
}

exports.deleteRestaurant = function(id, callback) {
	MongoClient.connect(url, function(err, db) {
		if(!err) {
            let myquery = { "_id": ObjectId(id)};
	        
			db.collection("restaurants")
			.deleteOne(myquery, function(err, result) {
	         	if(!err){
			    	reponse = {
		                succes : true,
		                result: result,
		                error : null,
		                msg: "Suppression réussie " + result
		            };
			   	} else {
		            reponse = {
		                succes : false,
		                error : err,
		                msg: "Problème à la suppression"
		            };
			    }
			    callback(reponse);
	        });
		} else{
			let reponse = reponse = {
                    	succes: false,
                        error : err,
                        msg:"Problème lors de la suppression, erreur de connexion."
                    };
            callback(reponse);
		}
	});
}