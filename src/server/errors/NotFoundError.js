
function NotFoundError(err) {
  if (err) {
    this.stack = err.stack;
  }
  this.message = 'Not Found';
  this.status = 404;
}

NotFoundError.prototype = Object.create(Error.prototype);

module.exports = NotFoundError;

