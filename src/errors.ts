export class InvalidAddressError extends Error {
  constructor(...params: any[]) {
    super(...params)
    this.name = 'InvalidAddressError'
  }
}

export class RelayAttemptsExhaustedError extends Error {
  constructor(...params: any[]) {
    super(...params)
    this.name = 'RelayAttemptsExhaustedError'
  }
}
