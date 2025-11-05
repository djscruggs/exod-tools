import { Contract } from '@algorandfoundation/algorand-typescript'

export class ExodTools extends Contract {
  hello(name: string): string {
    return `Hello, ${name}`
  }
}
