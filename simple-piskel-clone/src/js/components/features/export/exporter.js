import gifshot from 'gifshot';

// const toApng = require('gif-to-apng');

const exporter = {
  async downloadAsGif(arrayOfImagesUrls, interval, size) {
    if (!arrayOfImagesUrls || !arrayOfImagesUrls.length) return;

    const blob = await exporter.transformImagesToGifBlob(arrayOfImagesUrls, interval, size);

    exporter.saveBlobToFilesystem(blob);
  },

  // async downloadAsApng(arrayOfImagesUrls, interval, size) {
  //   if (!arrayOfImagesUrls || !arrayOfImagesUrls.length) return;

  //   const blob = await exporter.transformImagesToGifBlob(arrayOfImagesUrls, interval, size);
  //   const apngBlob = toApng('path/to/image.gif')
  //     .then(() => console.log('Done 🎉'))
  //     .catch((error) => console.log('Something went wrong 💀', error));
  // },

  saveBlobToFilesystem(blob) {
    const a = document.createElement('a');
    const link = window.URL.createObjectURL(blob);

    a.href = link;
    a.download = 'piskel.gif';
    a.click();
    window.URL.revokeObjectURL(link);
  },

  transformImagesToGifBlob(arrayOfImagesUrls, interval, size) {
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
            const blob = exporter.dataUrlToBlob(dataUrl);

            resolve(blob);
          }
        },
      );
    });
  },

  dataUrlToBlob(dataUrl) {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl
      .split(',')[0]
      .split(':')[1]
      .split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }

    const bb = new Blob([ab], { type: mimeString });
    return bb;
  },
};

export default exporter;
