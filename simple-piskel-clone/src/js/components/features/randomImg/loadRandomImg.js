import supportFunctions from '../../../helpers/supportFunctions';

export default async function loadRandomImgByQuery(query) {
  const baseLink = 'https://api.unsplash.com/photos/random?';
  const key = '3bc7ddad91eaf92b379173d13909b138856b2f3e622dc12b84e6be194907d42c';
  const url = `${baseLink}query=${query}&client_id=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const img = await supportFunctions.convertDataUrlToImg(data.urls.small);
    return img;
  } catch (error) {
    throw new Error(error);
  }
}
