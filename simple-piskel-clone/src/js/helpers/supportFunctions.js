const supportFunctions = {
  // TODO: send everywhere
  getUploadedImage(src) {
    const img = new Image();
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.src = src;
      img.onerror = () => reject(new Error());
    });
  },

  asyncForEach(array, asyncCallback) {
    return Promise.all(array.map((value, index) => asyncCallback(value, index)));
  },
};

export default supportFunctions;
