export default {
  get: require('get-value'),
  set: require('set-value'),
  has: require('has-value'),
  keys(obj, prefix) {
    let paths = [];
    prefix = (prefix && prefix + '.') || '';
    Object.keys(obj).forEach(key => {
      if (obj[key] instanceof Object) {
        paths = paths.concat(this.keys(obj[key], prefix + key));
      } else {
        paths.push(prefix + key);
      }
    });
    return paths;
  }
};
