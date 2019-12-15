const apiLoader = {
  async getJson(url) {
    const response = await fetch(url);
    const json = await response.json();

    return json;
  },

  async getImageJson(query) {
    const url = `https://cors-anywhere.herokuapp.com/https://api.unsplash.com/photos/random?query=${query}&client_id=ae8d7de6acc767654ce496c4d3cc5e08da2f74bae163d354d682e400d8cee33e`;

    return this.getJson(url);
  },
};

export default apiLoader;
