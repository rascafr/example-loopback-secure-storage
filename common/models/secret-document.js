'use strict';

const SecureStorage = require('loopback-secure-storage');

module.exports = function(SecretDocument) {

    /**
     * Creates a document with its parameters (name, etc) and uploads the associated PDF file
     * @param {Function(Error, boolean)} cb
     */
    SecretDocument.createFile = function(ctx, options, cb) {

        // Our SecureStorage module config has been configured to accept only pdf files under 50MB
        // so we don't have to perform any check here
        SecureStorage.saveAsEncryptedHTTPFile(ctx, (err, fileObj) => {
            if (err) return cb(err)

            // ensure we have a file
            if (!fileObj) {
                return cb(null, false);
            }

            // Get file object properties
            let {fileName, originalFileName} = fileObj; // you can add fileEncoding, fileMime, fileSize...

            // additionnal http params are set inside of the fields object
            // ex: let anotherRequestProp = fileObj.fields.myCustomProperty

            // Insert into database
            SecretDocument.create({uniqueName: fileName, originalName: originalFileName}, (err, modelInst) => {
                if (err) return cb(err);
                else return cb(null, true, modelInst);
            });
        });
    }

    /**
     * Downloads a document from the storage (after it has been unencrypted)
     */
    SecretDocument.downloadFile = function(id, res, cb) {

        // Get the document info so we can delete the stored file
        SecretDocument.findById(id, (err, docObj) => {
            if (err) return cb(err);

            // get file, get config / key, decrypt and send it back to the client
            SecureStorage.streamAsDecryptedHTTPFile(docObj.uniqueName, res, cb);
        });
    }

    /**
     * Delete a document (and the associated stored file)
     */
    SecretDocument.deleteFile = function(id, cb) {

        // Get the document info so we can delete the stored file
        SecretDocument.findById(id, (err, docObj) => {
            if (err) return cb(err);
            else if (docObj === null) return cb(null, false);
            else {
                // delete file
                SecureStorage.secureDelete(docObj.uniqueName, (deleted) => {

                    // if the pdf is not here (unknown reason) well we still continue,
                    // cause document is unusable without so deletion is the only exit

                    // delete the document db entry
                    SecretDocument.destroyById(id, (err) => {
                        if (err) return cb(err);
                        else cb(null, true);
                    });
                });
            }
        });
    }
};
