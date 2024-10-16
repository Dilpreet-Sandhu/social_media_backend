export class ApiError  {
    constructor(status,success,message,errors,stack) {
        this.message = message;
        this.status = status;
        this.message = message;
        this.stack = stack;
        this.data = null;
    }
}

export class ApiResponse {
    constructor(success,message,data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}