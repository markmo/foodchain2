import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace composer.base{
   export abstract class Business extends Participant {
      email: string;
      address: Address;
      accountBalance: number;
   }
   export class Address {
      city: string;
      country: string;
      locality: string;
      region: string;
      street: string;
      street2: string;
      street3: string;
      postcode: string;
      poBox: string;
   }
   export class Location {
      latitude: number;
      longitude: number;
   }
// }
