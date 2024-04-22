/**
 * User model
 */
class Tool {
  constructor(data = {}) {
    this.type = null;
    this.description = null;
    this.price = null;
    Object.assign(this, data);
  }
}

export default Tool;
