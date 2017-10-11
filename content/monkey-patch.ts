export = (object, method, patch) => {
  object[method] = patch(object[method])
}
