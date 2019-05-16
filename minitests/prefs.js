module.exports = {
  Preferences: {
    preferences: {},
    get: function(key) {
      console.log('get:', key, '=', this.preferences[key])
      return this.preferences[key]
    }
  }
}
