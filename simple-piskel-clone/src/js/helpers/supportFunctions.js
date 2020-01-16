const supportFunctions = {
  convertDataUrlToImg(src) {
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

  createDomElement(tag, classes, props) {
    const newElement = document.createElement(tag);

    newElement.className = classes;
    Object.assign(newElement, props);

    return newElement;
  },
};

export default supportFunctions;
