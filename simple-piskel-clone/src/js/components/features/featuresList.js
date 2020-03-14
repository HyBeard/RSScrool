import auth from './auth/auth';
import exporter from './export/exporter';
import loadRandomImg from './randomImg/loadRandomImg';

const featuresList = {
  auth,
  downloadAsGif: exporter.downloadAsGif,
  downloadAsApng: exporter.downloadAsApng,
  loadRandomImg,
};

export default featuresList;
