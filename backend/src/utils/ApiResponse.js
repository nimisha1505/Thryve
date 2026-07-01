class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;

    // Spread data keys to root if data is an object to maintain frontend compatibility
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}

export { ApiResponse };
