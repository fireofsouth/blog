module.exports = {
  get header() {
    return this.req.header;
  },
  set header(val) {
    this.req.header = val;
  }
};
