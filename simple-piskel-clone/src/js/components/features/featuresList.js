import auth from './auth/auth';
import exporter from './export/downloadAsGif';

const featuresList = {
  auth,
  downloadAsGif: exporter.downloadAsGif,
};

export default featuresList;
