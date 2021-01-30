module.exports = function assert(cond, msg) {
  if (cond) throw new Error(msg)
}
