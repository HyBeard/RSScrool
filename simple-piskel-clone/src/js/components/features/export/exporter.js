import gifshot from 'gifshot';
import UPNG from 'upng-js';
import base64Coder from 'base64-arraybuffer';

import supportFunctions from '../../../helpers/supportFunctions';


const exporter = {
  async downloadAsGif(arrayOfImagesUrls, interval, size) {
    if (!arrayOfImagesUrls || !arrayOfImagesUrls.length) return;

    const blob = await exporter.joinDataUrlsToGifBlob(arrayOfImagesUrls, interval, size);

    exporter.saveBlobToFilesystem(blob);
  },

  async downloadAsApng(arrayOfImagesUrls, interval, size) {
    if (!arrayOfImagesUrls || !arrayOfImagesUrls.length) return;

    const imgsArray = await supportFunctions.asyncForEach(arrayOfImagesUrls, async (dataUrl) => {
      const img = await supportFunctions.convertDataUrlToImg(dataUrl);

      return img;
    });

    const apngBlob = exporter.joinImagesToApngBlob(imgsArray, interval, size);

    exporter.saveBlobToFilesystem(apngBlob);
  },

  saveBlobToFilesystem(blob) {
    const fileExtension = blob.type.split('/')[1];
    const a = document.createElement('a');
    const link = window.URL.createObjectURL(blob);

    a.href = link;
    a.download = `piskel.${fileExtension}`;
    a.click();
    window.URL.revokeObjectURL(link);
  },

  joinDataUrlsToGifBlob(arrayOfImagesUrls, interval, size) {
    return new Promise((resolve, reject) => {
      gifshot.createGIF(
        {
          images: arrayOfImagesUrls,
          interval,
          gifWidth: size,
          gifHeight: size,
        },
        ({ error, image: dataUrl }) => {
          if (error) {
            reject(error);
          } else {
            const blob = exporter.convertDataUrlToBlob(dataUrl);

            resolve(blob);
          }
        },
      );
    });
  },

  joinImagesToApngBlob(imgsArray, interval, size) {
    const arrOfIntervals = new Array(imgsArray.length).fill(interval * 1000);
    const tempCanvas = document.createElement('canvas');
    const context = tempCanvas.getContext('2d');

    tempCanvas.width = size;
    tempCanvas.height = size;

    const summaryImgsDataArray = imgsArray.map((img) => {
      context.clearRect(0, 0, size, size);
      context.drawImage(img, 0, 0, size, size);

      const imageData = context.getImageData(0, 0, size, size).data;

      return imageData.buffer;
    });

    const ApngArrayBuffer = UPNG.encode(summaryImgsDataArray, size, size, 0, arrOfIntervals);

    return new Blob([ApngArrayBuffer], { type: 'image/apng' });
  },

  convertDataUrlToBlob(dataUrl) {
    const arrayBuffer = base64Coder.decode(dataUrl);
    const mimeString = dataUrl
      .split(',')[0]
      .split(':')[1]
      .split(';')[0];

    return new Blob([arrayBuffer], { type: mimeString });
  },
};

export default exporter;
