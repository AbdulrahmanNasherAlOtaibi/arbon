/** Domain error carrying an HTTP status code so routes can map it uniformly. */
export class DomainError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "DomainError";
    this.statusCode = statusCode;
  }
}
