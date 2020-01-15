import auth from './auth/auth';
import exporter from './export/exporter';

const featuresList = {
  auth,
  downloadAsGif: exporter.downloadAsGif,
  downloadAsApng: exporter.downloadAsApng,
};

export default featuresList;
