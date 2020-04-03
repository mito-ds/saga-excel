import base64js from 'base64-js';

/* global Office */

export async function getFileContents() {
    return await getCompressedDocument();
}

// The following example gets the document in Office Open XML ("compressed") format
function getCompressedDocument() {
    return new Promise((resolve, reject) => {
        Office.context.document.getFileAsync(Office.FileType.Compressed, { sliceSize: 65536 /*64 KB*/ }, 
            async function (result) {
                if (result.status == "succeeded") {
                    var myFile = result.value;
                    var sliceCount = myFile.sliceCount;

                    // TODO: make sure we get some error handling going!
                    // so we always close file...
                    const fileContent = await getSlicesAsync(myFile, sliceCount);
                    myFile.closeAsync();

                    resolve(fileContent);
                } else {
                    // reject with error
                    reject(result.error.message);
                }
            }
        );
    });
}
  

async function getSlicesAsync(file, sliceCount) {

    var byteArray = [];
    for (var i = 0; i < sliceCount; i++) {
        const sliceData = await getSliceAsync(file, i);
        byteArray = byteArray.concat(sliceData);
    }
    
    return base64js.fromByteArray(byteArray);
}

function getSliceAsync(file, sliceIndex) {
    return new Promise((resolve, reject) => {
        file.getSliceAsync(sliceIndex, function (sliceResult) {
            if (sliceResult.status == "succeeded") {
                // resolve with the data
                resolve(sliceResult.value.data);
            } else {
                // reject with nothing
                reject(sliceResult.error.message)
            }
        });
    });
}