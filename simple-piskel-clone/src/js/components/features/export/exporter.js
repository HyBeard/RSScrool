import gifshot from 'gifshot';

const exporter = {
  downloadAsGif(arrayOfImagesUrls, interval, size) {
    gifshot.createGIF(
      {
        images: arrayOfImagesUrls,
        interval,
        gifWidth: size,
        gifHeight: size,
      },
      ({ image: dataUrl, error }) => {
        if (!error) {
          const blob = exporter.dataUrlToBlob(dataUrl);
          const a = document.createElement('a');
          const link = window.URL.createObjectURL(blob);

          a.href = link;
          a.download = 'piskel.gif';
          a.click();
          window.URL.revokeObjectURL(link);
        }
      },
    );
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
